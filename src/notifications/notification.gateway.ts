import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AllConfigType } from '../config/config.type';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { Notification } from './domain/notification';

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: true, credentials: true },
})
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayloadType>(token, {
        secret: this.configService.getOrThrow('auth.secret', { infer: true }),
      });
      client.data.userId = payload.id;
      await client.join(this.userRoom(payload.id));
    } catch {
      client.disconnect();
    }
  }

  emitCreated(notification: Notification): void {
    this.server
      ?.to(this.userRoom(notification.recipientId))
      .emit('notification.created', notification);
  }

  emitUnreadCount(userId: string, count: number): void {
    this.server
      ?.to(this.userRoom(userId))
      .emit('notification.unread-count', { count });
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken) return authToken;

    const header = client.handshake.headers.authorization;
    return typeof header === 'string' && header.startsWith('Bearer ')
      ? header.slice(7)
      : null;
  }

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }
}

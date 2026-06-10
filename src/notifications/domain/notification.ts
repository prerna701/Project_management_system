import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../enums/notification-type.enum';

export class Notification {
  @ApiProperty() id: string;
  @ApiProperty() recipientId: string;
  @ApiPropertyOptional() triggeredById: string | null;
  @ApiProperty({ enum: NotificationType }) type: NotificationType;
  @ApiProperty() title: string;
  @ApiProperty() message: string;
  @ApiPropertyOptional() entityType: string | null;
  @ApiPropertyOptional() entityId: string | null;
  @ApiPropertyOptional() redirectUrl: string | null;
  @ApiProperty() isRead: boolean;
  @ApiPropertyOptional() readAt: Date | null;
  @ApiPropertyOptional() metadata: Record<string, any> | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

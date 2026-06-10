import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { RelationalNotificationsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationGateway } from './notification.gateway';
import { NotificationTemplateRegistry } from './notification-template.registry';

@Module({
  imports: [RelationalNotificationsPersistenceModule, JwtModule.register({})],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationGateway,
    NotificationTemplateRegistry,
  ],
  exports: [NotificationsService, NotificationGateway],
})
export class NotificationsModule {}

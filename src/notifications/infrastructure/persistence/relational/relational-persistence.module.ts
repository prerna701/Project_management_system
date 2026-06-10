import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { RelationalNotificationsRepository } from './repositories/notifications.repository';
import { NotificationsRepository } from '../notifications.repository';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  providers: [
    {
      provide: NotificationsRepository,
      useClass: RelationalNotificationsRepository,
    },
  ],
  exports: [NotificationsRepository],
})
export class RelationalNotificationsPersistenceModule {}

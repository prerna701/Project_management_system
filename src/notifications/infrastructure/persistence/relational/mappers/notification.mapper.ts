import { Notification } from '../../../../domain/notification';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationType } from '../../../../enums/notification-type.enum';

export class NotificationMapper {
  static toDomain(raw: NotificationEntity): Notification {
    const domain = new Notification();
    domain.id = raw.id;
    domain.recipientId = raw.recipientId;
    domain.triggeredById = raw.triggeredById;
    domain.type = raw.type as NotificationType;
    domain.title = raw.title;
    domain.message = raw.message;
    domain.entityType = raw.entityType;
    domain.entityId = raw.entityId;
    domain.redirectUrl = raw.redirectUrl;
    domain.isRead = raw.isRead;
    domain.readAt = raw.readAt;
    domain.metadata = raw.metadata;
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    return domain;
  }

  static toPersistence(domain: Partial<Notification>): Partial<NotificationEntity> {
    const entity: Partial<NotificationEntity> = {};
    if (domain.id !== undefined) entity.id = domain.id;
    if (domain.recipientId !== undefined) entity.recipientId = domain.recipientId;
    if (domain.triggeredById !== undefined) entity.triggeredById = domain.triggeredById;
    if (domain.type !== undefined) entity.type = domain.type;
    if (domain.title !== undefined) entity.title = domain.title;
    if (domain.message !== undefined) entity.message = domain.message;
    if (domain.entityType !== undefined) entity.entityType = domain.entityType;
    if (domain.entityId !== undefined) entity.entityId = domain.entityId;
    if (domain.redirectUrl !== undefined) entity.redirectUrl = domain.redirectUrl;
    if (domain.isRead !== undefined) entity.isRead = domain.isRead;
    if (domain.readAt !== undefined) entity.readAt = domain.readAt;
    if (domain.metadata !== undefined) entity.metadata = domain.metadata;
    return entity;
  }
}

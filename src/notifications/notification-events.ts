import { NotificationType } from './enums/notification-type.enum';

export interface NotificationEvent {
  type: NotificationType;
  recipientIds: string[];
  actorId?: string | null;
  resource?: {
    type: string;
    id: string;
  };
  redirectUrl?: string | null;
  context: Record<string, unknown>;
}

export interface NotificationTemplate {
  title: string;
  message: string;
}

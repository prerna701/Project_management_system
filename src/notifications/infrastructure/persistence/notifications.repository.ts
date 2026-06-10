import { Notification } from '../../domain/notification';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class NotificationsRepository {
  abstract create(item: Partial<Notification>): Promise<Notification>;

  abstract findByUser(
    userId: string,
    paginationOptions: IPaginationOptions,
  ): Promise<{ items: Notification[]; meta: PaginationMetaDto }>;

  abstract countUnread(userId: string): Promise<number>;

  abstract markAsRead(id: string, userId: string): Promise<void>;

  abstract markAllAsRead(userId: string): Promise<void>;

  abstract deleteByIdAndUser(id: string, userId: string): Promise<void>;
}

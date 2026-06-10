import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationsRepository } from '../../notifications.repository';
import { Notification } from '../../../../domain/notification';
import { NotificationMapper } from '../mappers/notification.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class RelationalNotificationsRepository implements NotificationsRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  async create(item: Partial<Notification>): Promise<Notification> {
    const entity = this.repo.create(NotificationMapper.toPersistence(item) as NotificationEntity);
    const saved = await this.repo.save(entity);
    return NotificationMapper.toDomain(saved);
  }

  async findByUser(
    userId: string,
    paginationOptions: IPaginationOptions,
  ): Promise<{ items: Notification[]; meta: PaginationMetaDto }> {
    const { page, limit } = paginationOptions;

    const [entities, totalItems] = await this.repo.findAndCount({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: entities.map(NotificationMapper.toDomain),
      meta: {
        currentPage: page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async countUnread(userId: string): Promise<number> {
    return this.repo.count({ where: { recipientId: userId, isRead: false } });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.repo.update(
      { id, recipientId: userId },
      { isRead: true, readAt: new Date() },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ isRead: true, readAt: new Date() })
      .where('recipient_id = :userId AND is_read = false', { userId })
      .execute();
  }

  async deleteByIdAndUser(id: string, userId: string): Promise<void> {
    await this.repo.delete({ id, recipientId: userId });
  }
}

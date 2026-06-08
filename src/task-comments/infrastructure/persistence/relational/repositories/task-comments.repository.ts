import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskCommentEntity } from '../entities/task-comment.entity';
import { TaskCommentsRepository } from '../../task-comments.repository';
import { TaskComment } from '../../../../domain/task-comment';
import { TaskCommentMapper } from '../mappers/task-comment.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class RelationalTaskCommentsRepository implements TaskCommentsRepository {
  constructor(
    @InjectRepository(TaskCommentEntity)
    private readonly repo: Repository<TaskCommentEntity>,
  ) {}

  async findById(id: string): Promise<TaskComment | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? TaskCommentMapper.toDomain(entity) : null;
  }

  async findByTaskId(
    taskId: string,
    options: { paginationOptions: IPaginationOptions },
  ): Promise<{ items: TaskComment[]; meta: PaginationMetaDto }> {
    const { page, limit } = options.paginationOptions;
    const query = this.repo
      .createQueryBuilder('comment')
      .where('comment.taskId = :taskId', { taskId })
      .andWhere('comment.deletedAt IS NULL');

    const totalItems = await query.getCount();
    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('comment.createdAt', 'ASC')
      .getMany();

    return {
      items: entities.map(TaskCommentMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async create(item: Partial<TaskComment>): Promise<TaskComment> {
    const entity = this.repo.create(TaskCommentMapper.toPersistence(item) as TaskCommentEntity);
    const saved = await this.repo.save(entity);
    return TaskCommentMapper.toDomain(saved);
  }

  async update(id: string, item: Partial<TaskComment>): Promise<TaskComment | null> {
    await this.repo.update(id, TaskCommentMapper.toPersistence(item) as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}

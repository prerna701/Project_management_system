import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { TaskEntity } from '../entities/task.entity';
import { TasksRepository } from '../../tasks.repository';
import { Task } from '../../../../domain/task';
import { TaskMapper } from '../mappers/task.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';
import { TaskStatus } from '../../../../enums/task-status.enum';

@Injectable()
export class RelationalTasksRepository implements TasksRepository {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly repo: Repository<TaskEntity>,
  ) {}

  async findById(id: string): Promise<Task | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? TaskMapper.toDomain(entity) : null;
  }

  async findManyWithPagination(options: {
    paginationOptions: IPaginationOptions;
    search?: string;
    projectId?: string;
    milestoneId?: string;
    assigneeId?: string;
    parentTaskId?: string | null;
  }): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    const { paginationOptions, search, projectId, milestoneId, assigneeId, parentTaskId } = options;
    const query = this.repo.createQueryBuilder('task').where('task.deletedAt IS NULL');

    if (projectId) {
      query.andWhere('task.projectId = :projectId', { projectId });
    }
    if (milestoneId) {
      query.andWhere('task.milestoneId = :milestoneId', { milestoneId });
    }
    if (assigneeId) {
      query.andWhere('task.assigneeId = :assigneeId', { assigneeId });
    }
    if (parentTaskId !== undefined) {
      if (parentTaskId === null) {
        query.andWhere('task.parentTaskId IS NULL');
      } else {
        query.andWhere('task.parentTaskId = :parentTaskId', { parentTaskId });
      }
    }
    if (search) {
      query.andWhere('task.title ILIKE :search', { search: `%${search}%` });
    }

    const totalItems = await query.getCount();
    const { page, limit } = paginationOptions;

    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('task.createdAt', 'DESC')
      .getMany();

    return {
      items: entities.map(TaskMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async create(item: Partial<Task>): Promise<Task> {
    const entity = this.repo.create(TaskMapper.toPersistence(item) as TaskEntity);
    const saved = await this.repo.save(entity);
    return TaskMapper.toDomain(saved);
  }

  async update(id: string, item: Partial<Task>): Promise<Task | null> {
    await this.repo.update(id, TaskMapper.toPersistence(item) as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async countByProjectId(projectId: string): Promise<{ total: number; completed: number }> {
    const total = await this.repo.count({ where: { projectId, deletedAt: IsNull() } });
    const completed = await this.repo.count({
      where: { projectId, status: TaskStatus.DONE, deletedAt: IsNull() },
    });
    return { total, completed };
  }

  async reassignOpenTasks(fromUserId: string, toUserId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(TaskEntity)
      .set({ assigneeId: toUserId })
      .where('assigneeId = :fromUserId AND status NOT IN (:...doneStatuses) AND deletedAt IS NULL', {
        fromUserId,
        doneStatuses: [TaskStatus.DONE],
      })
      .execute();
  }
}

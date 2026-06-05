import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { TaskEntity } from '../entities/task.entity';
import { TaskStatusHistoryEntity } from '../entities/task-status-history.entity';
import { TasksRepository, TaskStatusHistoryEntry } from '../../tasks.repository';
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
    @InjectRepository(TaskStatusHistoryEntity)
    private readonly statusHistoryRepo: Repository<TaskStatusHistoryEntity>,
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
    withoutMilestone?: boolean;
    assigneeId?: string;
  }): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    const { paginationOptions, search, projectId, milestoneId, withoutMilestone, assigneeId } = options;
    const query = this.repo.createQueryBuilder('task').where('task.deletedAt IS NULL');

    if (projectId) {
      query.andWhere('task.projectId = :projectId', { projectId });
    }
    if (milestoneId) {
      query.andWhere('task.milestoneId = :milestoneId', { milestoneId });
    }
    if (withoutMilestone) {
      query.andWhere('task.milestoneId IS NULL');
    }
    if (assigneeId) {
      query.andWhere('task.assigneeId = :assigneeId', { assigneeId });
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

  async findProjectTaskIds(projectId: string, taskIds: string[]): Promise<string[]> {
    if (taskIds.length === 0) return [];

    const rows = await this.repo.find({
      select: { id: true },
      where: {
        id: In(taskIds),
        projectId,
        deletedAt: IsNull(),
      },
    });

    return rows.map((row) => row.id);
  }

  async assignMilestoneToTasks(
    projectId: string,
    milestoneId: string,
    taskIds: string[],
  ): Promise<void> {
    if (taskIds.length === 0) return;

    await this.repo.update(
      {
        id: In(taskIds),
        projectId,
        deletedAt: IsNull(),
      },
      { milestoneId },
    );
  }

  async countByProjectId(projectId: string): Promise<{ total: number; completed: number }> {
    const total = await this.repo.count({ where: { projectId, deletedAt: IsNull() } });
    const completed = await this.repo.count({
      where: { projectId, status: TaskStatus.DONE, deletedAt: IsNull() },
    });
    return { total, completed };
  }

  async countByMilestoneId(
    milestoneId: string,
  ): Promise<{ total: number; completed: number; byStatus: Record<string, number> }> {
    const rows = await this.repo
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.milestoneId = :milestoneId', { milestoneId })
      .andWhere('task.deletedAt IS NULL')
      .groupBy('task.status')
      .getRawMany<{ status: TaskStatus; count: string }>();

    const byStatus = rows.reduce<Record<string, number>>((accumulator, row) => {
      accumulator[row.status] = Number(row.count);
      return accumulator;
    }, {});
    const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0);
    const completed = byStatus[TaskStatus.DONE] ?? 0;

    return { total, completed, byStatus };
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

  async recordStatusChange(
    entry: Omit<TaskStatusHistoryEntry, 'id' | 'createdAt'>,
  ): Promise<TaskStatusHistoryEntry> {
    const saved = await this.statusHistoryRepo.save(
      this.statusHistoryRepo.create({
        taskId: entry.taskId,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        changedBy: entry.changedBy,
        note: entry.note ?? null,
      }),
    );
    return {
      id: saved.id,
      taskId: saved.taskId,
      fromStatus: saved.fromStatus,
      toStatus: saved.toStatus,
      changedBy: saved.changedBy,
      note: saved.note,
      createdAt: saved.createdAt,
    };
  }

  async findStatusHistory(taskId: string): Promise<TaskStatusHistoryEntry[]> {
    const rows = await this.statusHistoryRepo.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => ({
      id: r.id,
      taskId: r.taskId,
      fromStatus: r.fromStatus,
      toStatus: r.toStatus,
      changedBy: r.changedBy,
      note: r.note,
      createdAt: r.createdAt,
    }));
  }
}

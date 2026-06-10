import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { TaskEntity } from '../entities/task.entity';
import { TasksRepository } from '../../tasks.repository';
import { Task } from '../../../../domain/task';
import { TaskMapper } from '../mappers/task.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';
import { TaskStatus } from '../../../../enums/task-status.enum';
import {
  LoggableTaskOption,
  TaskAccessOptions,
} from '../../tasks.repository';

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

  async findLoggableOptions(
    userId: string,
    isAdmin: boolean,
  ): Promise<LoggableTaskOption[]> {
    const rows = await this.repo.manager.query(
      `SELECT
        task.id,
        task.title,
        task."projectId",
        project.name AS "projectName",
        project.code AS "projectCode"
      FROM tasks task
      INNER JOIN projects project
        ON project.id = task."projectId"
        AND project."deletedAt" IS NULL
      WHERE task."deletedAt" IS NULL
        AND task."parentTaskId" IS NULL
        AND (
            $2::boolean = true
            OR task."assigneeId" = $1
            OR (
              task."assigneeId" IS NULL
              AND task."reporterId" = $1
            )
            OR EXISTS (
            SELECT 1
            FROM team_members tm
            WHERE tm."teamId" = project."assignedTeamId"
              AND tm."userId" = $1
              AND tm."isActive" = true
          )
        )
      ORDER BY project.name ASC, task.title ASC`,
      [userId, isAdmin],
    );

    return rows as LoggableTaskOption[];
  }

  async findManyWithPagination(options: {
    paginationOptions: IPaginationOptions;
    search?: string;
    projectId?: string;
    milestoneId?: string;
    assigneeId?: string;
    parentTaskId?: string | null;
    access?: TaskAccessOptions;
  }): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    const {
      paginationOptions,
      search,
      projectId,
      milestoneId,
      assigneeId,
      parentTaskId,
      access,
    } = options;
    const query = this.repo.createQueryBuilder('task').where('task.deletedAt IS NULL');

    if (access && !access.isAdmin) {
      query.andWhere(
        `(
          task."assigneeId" = :accessUserId
          OR task."reporterId" = :accessUserId
          OR EXISTS (
            SELECT 1
            FROM projects project
            WHERE project.id = task."projectId"
              AND project."deletedAt" IS NULL
              AND (
                project.visibility = 'PUBLIC'
                OR project."createdBy" = :accessUserId
                OR project."projectManagerId" = :accessUserId
                OR EXISTS (
                  SELECT 1
                  FROM team_members team_member
                  WHERE team_member."teamId" = project."assignedTeamId"
                    AND team_member."userId" = :accessUserId
                    AND team_member."isActive" = true
                )
              )
          )
        )`,
        { accessUserId: access.userId },
      );
    }

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

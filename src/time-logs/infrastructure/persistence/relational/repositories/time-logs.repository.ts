import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { TimeLog } from '../../../../domain/time-log';
import { TimeLogStatus } from '../../../../enums/time-log-status.enum';
import {
  TimeLogFilters,
  TimeLogReportSummary,
  TimeLogsRepository,
} from '../../time-logs.repository';
import { TimeLogEntity } from '../entities/time-log.entity';
import { TimeLogMapper } from '../mappers/time-log.mapper';
import { TaskEntity } from '../../../../../tasks/infrastructure/persistence/relational/entities/task.entity';
import { TaskStatus } from '../../../../../tasks/enums/task-status.enum';

@Injectable()
export class RelationalTimeLogsRepository implements TimeLogsRepository {
  constructor(
    @InjectRepository(TimeLogEntity)
    private readonly repo: Repository<TimeLogEntity>,
  ) {}

  async findById(id: string): Promise<TimeLog | null> {
    const entity = await this.repo.findOne({
      where: { id },
      withDeleted: false,
    });
    return entity ? TimeLogMapper.toDomain(entity) : null;
  }

  async findActiveByUser(userId: string): Promise<TimeLog | null> {
    const entity = await this.repo
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.endedAt IS NULL')
      .andWhere('log.deletedAt IS NULL')
      .getOne();
    return entity ? TimeLogMapper.toDomain(entity) : null;
  }

  async findMany(options: {
    paginationOptions: IPaginationOptions;
    filters: TimeLogFilters;
  }): Promise<{ items: TimeLog[]; meta: PaginationMetaDto }> {
    const query = this.applyFilters(
      this.repo
        .createQueryBuilder('log')
        .leftJoin('users', 'list_user', 'list_user.id = log.userId')
        .leftJoin('tasks', 'list_task', 'list_task.id = log.taskId')
        .leftJoin('projects', 'list_project', 'list_project.id = log.projectId')
        .addSelect(
          `TRIM(CONCAT(COALESCE(list_user."firstName", ''), ' ', COALESCE(list_user."lastName", '')))`,
          'timeLogUserName',
        )
        .addSelect('list_task.title', 'timeLogTaskTitle')
        .addSelect('list_project.name', 'timeLogProjectName')
        .where('log.deletedAt IS NULL'),
      options.filters,
    );
    const totalItems = await query.getCount();
    const { page, limit } = options.paginationOptions;
    const result = await query
      .orderBy('log.startedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawAndEntities();

    return {
      items: result.entities.map((entity, index) => ({
        ...TimeLogMapper.toDomain(entity),
        userName: result.raw[index]?.timeLogUserName || 'Unknown user',
        taskTitle: result.raw[index]?.timeLogTaskTitle || 'Unknown task',
        projectName: result.raw[index]?.timeLogProjectName || 'Unknown project',
      })),
      meta: {
        currentPage: page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async create(item: Partial<TimeLog>): Promise<TimeLog> {
    const entity = this.repo.create(
      TimeLogMapper.toPersistence(item) as TimeLogEntity,
    );
    return TimeLogMapper.toDomain(await this.repo.save(entity));
  }

  async createAndStartTask(item: Partial<TimeLog>): Promise<TimeLog> {
    return this.repo.manager.transaction(async (manager) => {
      const timeLogRepo = manager.getRepository(TimeLogEntity);
      const entity = timeLogRepo.create(
        TimeLogMapper.toPersistence(item) as TimeLogEntity,
      );
      const saved = await timeLogRepo.save(entity);
      await manager
        .getRepository(TaskEntity)
        .createQueryBuilder()
        .update(TaskEntity)
        .set({ status: TaskStatus.IN_PROGRESS })
        .where('id = :taskId', { taskId: item.taskId })
        .andWhere('status = :openStatus', { openStatus: TaskStatus.OPEN })
        .execute();
      return TimeLogMapper.toDomain(saved);
    });
  }

  async update(id: string, item: Partial<TimeLog>): Promise<TimeLog | null> {
    await this.repo.update(id, TimeLogMapper.toPersistence(item) as any);
    return this.findById(id);
  }

  async updateLogAndTaskStatus(
    id: string,
    logUpdate: Partial<TimeLog>,
    taskStatus: TaskStatus,
  ): Promise<TimeLog | null> {
    return this.repo.manager.transaction(async (manager) => {
      const timeLogRepo = manager.getRepository(TimeLogEntity);
      const current = await timeLogRepo.findOne({ where: { id } });
      if (!current) return null;

      await timeLogRepo.update(
        id,
        TimeLogMapper.toPersistence(logUpdate) as Partial<TimeLogEntity>,
      );
      await manager.getRepository(TaskEntity).update(current.taskId, {
        status: taskStatus,
      });
      const updated = await timeLogRepo.findOne({ where: { id } });
      return updated ? TimeLogMapper.toDomain(updated) : null;
    });
  }

  async removeActiveByUser(userId: string): Promise<TimeLog | null> {
    const active = await this.findActiveByUser(userId);
    if (!active) return null;

    await this.repo.softDelete({
      id: active.id,
      userId,
    });
    return active;
  }

  async sumApprovedMinutesByTask(taskId: string): Promise<number> {
    const row = await this.repo
      .createQueryBuilder('log')
      .select('COALESCE(SUM(log.durationMinutes), 0)', 'minutes')
      .where('log.taskId = :taskId', { taskId })
      .andWhere('log.status = :status', { status: TimeLogStatus.APPROVED })
      .andWhere('log.deletedAt IS NULL')
      .getRawOne<{ minutes: string }>();
    return Number(row?.minutes ?? 0);
  }

  async getReportSummary(
    filters: TimeLogFilters,
  ): Promise<TimeLogReportSummary> {
    const base = this.applyFilters(
      this.repo.createQueryBuilder('log').where('log.deletedAt IS NULL'),
      filters,
    );

    const totalsRow = await base
      .clone()
      .select(
        `COALESCE(SUM(CASE WHEN log.status = 'APPROVED' THEN log.durationMinutes ELSE 0 END), 0)`,
        'approvedMinutes',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN log.status = 'SUBMITTED' THEN log.durationMinutes ELSE 0 END), 0)`,
        'pendingMinutes',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN log.status = 'APPROVED' AND log.isBillable = true THEN log.durationMinutes ELSE 0 END), 0)`,
        'billableMinutes',
      )
      .addSelect('COUNT(log.id)', 'entryCount')
      .getRawOne<Record<string, string>>();

    const users = await base
      .clone()
      .leftJoin('users', 'app_user', 'app_user.id = log.userId')
      .select('log.userId', 'userId')
      .addSelect(
        `TRIM(CONCAT(COALESCE(app_user."firstName", ''), ' ', COALESCE(app_user."lastName", '')))`,
        'name',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN log.status = 'APPROVED' THEN log.durationMinutes ELSE 0 END), 0)`,
        'approvedMinutes',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN log.status = 'SUBMITTED' THEN log.durationMinutes ELSE 0 END), 0)`,
        'pendingMinutes',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN log.status = 'APPROVED' AND log.isBillable = true THEN log.durationMinutes ELSE 0 END), 0)`,
        'billableMinutes',
      )
      .groupBy('log.userId')
      .addGroupBy('app_user.firstName')
      .addGroupBy('app_user.lastName')
      .orderBy('"approvedMinutes"', 'DESC')
      .getRawMany<Record<string, string>>();

    const projects = await base
      .clone()
      .leftJoin('projects', 'project', 'project.id = log.projectId')
      .select('log.projectId', 'projectId')
      .addSelect('project.name', 'projectName')
      .addSelect(
        `COALESCE(SUM(CASE WHEN log.status = 'APPROVED' THEN log.durationMinutes ELSE 0 END), 0)`,
        'approvedMinutes',
      )
      .groupBy('log.projectId')
      .addGroupBy('project.name')
      .orderBy('"approvedMinutes"', 'DESC')
      .getRawMany<Record<string, string>>();

    const params: unknown[] = [];
    let projectCondition = '';
    if (filters.projectId) {
      params.push(filters.projectId);
      projectCondition = ` AND task."projectId" = $${params.length}`;
    }
    if (!filters.isAdmin && filters.managedByUserId) {
      params.push(filters.managedByUserId);
      projectCondition += ` AND EXISTS (
        SELECT 1
        FROM projects managed_project
        WHERE managed_project.id = task."projectId"
          AND managed_project."deletedAt" IS NULL
          AND (
            managed_project."createdBy" = $${params.length}
            OR managed_project."projectManagerId" = $${params.length}
            OR EXISTS (
              SELECT 1
              FROM teams managed_team
              WHERE managed_team.id = managed_project."assignedTeamId"
                AND managed_team."deletedAt" IS NULL
                AND managed_team."teamLeadId" = $${params.length}
            )
          )
      )`;
    }

    const [overdueRows, priorityRows, estimateRows] = await Promise.all([
      this.repo.manager.query(
        `SELECT COUNT(*)::int AS count
         FROM tasks task
         WHERE task."deletedAt" IS NULL
           AND task."dueDate" < now()
           AND task.status <> 'DONE'
           ${projectCondition}`,
        params,
      ),
      this.repo.manager.query(
        `SELECT task.priority, COUNT(*)::int AS count
         FROM tasks task
         WHERE task."deletedAt" IS NULL
           ${projectCondition}
         GROUP BY task.priority
         ORDER BY count DESC`,
        params,
      ),
      this.repo.manager.query(
        `SELECT task."projectId" AS "projectId",
                COALESCE(SUM(COALESCE(task."estimatedHours", 0) * 60), 0) AS "estimatedMinutes"
         FROM tasks task
         WHERE task."deletedAt" IS NULL
           ${projectCondition}
         GROUP BY task."projectId"`,
        params,
      ),
    ]);
    const estimates = new Map<string, number>(
      estimateRows.map((row: { projectId: string; estimatedMinutes: string }) => [
        row.projectId,
        Number(row.estimatedMinutes ?? 0),
      ]),
    );

    return {
      totals: {
        approvedMinutes: Number(totalsRow?.approvedMinutes ?? 0),
        pendingMinutes: Number(totalsRow?.pendingMinutes ?? 0),
        billableMinutes: Number(totalsRow?.billableMinutes ?? 0),
        entryCount: Number(totalsRow?.entryCount ?? 0),
        overdueTasks: Number(overdueRows[0]?.count ?? 0),
      },
      users: users.map((row) => ({
        userId: row.userId,
        name: row.name || 'Unknown user',
        approvedMinutes: Number(row.approvedMinutes ?? 0),
        pendingMinutes: Number(row.pendingMinutes ?? 0),
        billableMinutes: Number(row.billableMinutes ?? 0),
      })),
      projects: projects.map((row) => ({
        projectId: row.projectId,
        projectName: row.projectName || 'Unknown project',
        estimatedMinutes: estimates.get(row.projectId) ?? 0,
        approvedMinutes: Number(row.approvedMinutes ?? 0),
      })),
      priorities: priorityRows.map(
        (row: { priority: string; count: number | string }) => ({
          priority: row.priority,
          count: Number(row.count),
        }),
      ),
    };
  }

  private applyFilters(
    query: SelectQueryBuilder<TimeLogEntity>,
    filters: TimeLogFilters,
  ): SelectQueryBuilder<TimeLogEntity> {
    if (filters.from) {
      query.andWhere('log.startedAt >= :from', { from: filters.from });
    }
    if (filters.to) {
      query.andWhere('log.startedAt <= :to', { to: filters.to });
    }
    if (filters.projectId) {
      query.andWhere('log.projectId = :projectId', {
        projectId: filters.projectId,
      });
    }
    if (filters.taskId) {
      query.andWhere('log.taskId = :taskId', { taskId: filters.taskId });
    }
    if (filters.userId) {
      query.andWhere('log.userId = :userId', { userId: filters.userId });
    }
    if (filters.status) {
      query.andWhere('log.status = :status', { status: filters.status });
    }
    const access = this.accessCondition(filters);
    if (access.sql) {
      query.andWhere(access.sql, { managerId: filters.managedByUserId });
    }
    return query;
  }

  private accessCondition(filters: TimeLogFilters): { sql: string } {
    if (filters.isAdmin || !filters.managedByUserId) return { sql: '' };
    return {
      sql: `EXISTS (
        SELECT 1
        FROM projects managed_project
        WHERE managed_project.id = log."projectId"
          AND managed_project."deletedAt" IS NULL
          AND (
            managed_project."createdBy" = :managerId
            OR managed_project."projectManagerId" = :managerId
            OR EXISTS (
              SELECT 1
              FROM teams managed_team
              WHERE managed_team.id = managed_project."assignedTeamId"
                AND managed_team."deletedAt" IS NULL
                AND managed_team."teamLeadId" = :managerId
            )
          )
      )`,
    };
  }
}

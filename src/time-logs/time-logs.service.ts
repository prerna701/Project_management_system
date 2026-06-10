import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { IPaginationOptions } from '../common/types/pagination-options';
import { ProjectsRepository } from '../projects/infrastructure/persistence/projects.repository';
import { RoleEnum } from '../roles/roles.enum';
import { TasksRepository } from '../tasks/infrastructure/persistence/tasks.repository';
import { TasksService } from '../tasks/tasks.service';
import { UserRepository } from '../users/infrastructure/persistence/user.repository';
import { CreateManualTimeLogDto } from './dto/create-manual-time-log.dto';
import { ReviewTimeLogDto } from './dto/review-time-log.dto';
import { StartTimerDto } from './dto/start-timer.dto';
import { StopTimerDto } from './dto/stop-timer.dto';
import { TimeLogQueryDto } from './dto/time-log-query.dto';
import { UpdateTimeLogDto } from './dto/update-time-log.dto';
import { TimeLog } from './domain/time-log';
import { TimeEntryType } from './enums/time-entry-type.enum';
import { TimeLogStatus } from './enums/time-log-status.enum';
import { TimerState } from './enums/timer-state.enum';
import { WorkType } from './enums/work-type.enum';
import {
  TimeLogFilters,
  TimeLogReportSummary,
  TimeLogsRepository,
} from './infrastructure/persistence/time-logs.repository';

@Injectable()
export class TimeLogsService {
  constructor(
    private readonly repository: TimeLogsRepository,
    private readonly tasksService: TasksService,
    private readonly tasksRepository: TasksRepository,
    private readonly projectsRepository: ProjectsRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async startTimer(
    user: JwtPayloadType,
    dto: StartTimerDto,
  ): Promise<TimeLog> {
    if (await this.repository.findActiveByUser(user.id)) {
      throw new ConflictException(
        'Stop or pause the current timer before starting another task',
      );
    }
    const task = await this.tasksService.findById(dto.taskId, user);
    await this.assertCanLogTask(task, user);
    const now = new Date();
    try {
      return await this.repository.create({
        taskId: task.id,
        projectId: task.projectId,
        userId: user.id,
        startedAt: now,
        activeSince: now,
        pausedAt: null,
        endedAt: null,
        durationMinutes: 0,
        description: dto.description ?? null,
        workType: dto.workType ?? WorkType.DEVELOPMENT,
        entryType: TimeEntryType.TIMER,
        timerState: TimerState.ACTIVE,
        status: TimeLogStatus.DRAFT,
        isBillable: dto.isBillable ?? task.isBillable,
        manualEntryReason: null,
        reviewedById: null,
        reviewedAt: null,
        rejectionReason: null,
      });
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('You already have an active timer');
      }
      throw error;
    }
  }

  async getActiveTimer(userId: string): Promise<TimeLog | null> {
    return this.repository.findActiveByUser(userId);
  }

  async getLoggableOptions(user: JwtPayloadType): Promise<
    Array<{
      id: string;
      name: string;
      code: string | null;
      tasks: Array<{ id: string; title: string }>;
    }>
  > {
    const options = await this.tasksRepository.findLoggableOptions(
      user.id,
      await this.isAdmin(user),
    );
    const projects = new Map<
      string,
      {
        id: string;
        name: string;
        code: string | null;
        tasks: Array<{ id: string; title: string }>;
      }
    >();

    for (const option of options) {
      const project = projects.get(option.projectId) ?? {
        id: option.projectId,
        name: option.projectName,
        code: option.projectCode,
        tasks: [],
      };
      project.tasks.push({ id: option.id, title: option.title });
      projects.set(option.projectId, project);
    }

    return [...projects.values()];
  }

  async pauseTimer(userId: string): Promise<TimeLog> {
    const active = await this.requireActiveTimer(userId);
    if (active.timerState !== TimerState.ACTIVE || !active.activeSince) {
      throw new BadRequestException('The timer is already paused');
    }
    const now = new Date();
    return this.requireUpdated(
      active.id,
      await this.repository.update(active.id, {
        durationMinutes:
          active.durationMinutes +
          this.diffMinutes(active.activeSince, now),
        activeSince: null,
        pausedAt: now,
        timerState: TimerState.PAUSED,
      }),
    );
  }

  async resumeTimer(userId: string): Promise<TimeLog> {
    const active = await this.requireActiveTimer(userId);
    if (active.timerState !== TimerState.PAUSED) {
      throw new BadRequestException('The timer is not paused');
    }
    return this.requireUpdated(
      active.id,
      await this.repository.update(active.id, {
        activeSince: new Date(),
        pausedAt: null,
        timerState: TimerState.ACTIVE,
      }),
    );
  }

  async stopTimer(userId: string, dto: StopTimerDto): Promise<TimeLog> {
    const active = await this.requireActiveTimer(userId);
    const now = new Date();
    const additionalMinutes =
      active.timerState === TimerState.ACTIVE && active.activeSince
        ? this.diffMinutes(active.activeSince, now)
        : 0;
    const item = await this.repository.update(active.id, {
      durationMinutes: active.durationMinutes + additionalMinutes,
      activeSince: null,
      pausedAt: null,
      endedAt: now,
      timerState: TimerState.STOPPED,
      description: dto.description ?? active.description,
    });
    return this.requireUpdated(active.id, item);
  }

  async createManual(
    user: JwtPayloadType,
    dto: CreateManualTimeLogDto,
  ): Promise<TimeLog> {
    const task = await this.tasksService.findById(dto.taskId, user);
    await this.assertCanLogTask(task, user);
    const startedAt = new Date(dto.startedAt);
    const endedAt = new Date(dto.endedAt);
    this.assertValidRange(startedAt, endedAt);
    return this.repository.create({
      taskId: task.id,
      projectId: task.projectId,
      userId: user.id,
      startedAt,
      activeSince: null,
      pausedAt: null,
      endedAt,
      durationMinutes: this.diffMinutes(startedAt, endedAt),
      description: dto.description ?? null,
      workType: dto.workType ?? WorkType.DEVELOPMENT,
      entryType: TimeEntryType.MANUAL,
      timerState: TimerState.STOPPED,
      status: TimeLogStatus.DRAFT,
      isBillable: dto.isBillable ?? task.isBillable,
      manualEntryReason: dto.manualEntryReason,
      reviewedById: null,
      reviewedAt: null,
      rejectionReason: null,
    });
  }

  async updateOwnDraft(
    id: string,
    userId: string,
    dto: UpdateTimeLogDto,
  ): Promise<TimeLog> {
    const log = await this.requireById(id);
    if (log.userId !== userId) {
      throw new ForbiddenException('You can only edit your own time logs');
    }
    if (log.status !== TimeLogStatus.DRAFT || !log.endedAt) {
      throw new BadRequestException(
        'Only stopped draft time logs can be edited',
      );
    }
    const startedAt = dto.startedAt
      ? new Date(dto.startedAt)
      : log.startedAt;
    const endedAt = dto.endedAt ? new Date(dto.endedAt) : log.endedAt;
    this.assertValidRange(startedAt, endedAt);
    return this.requireUpdated(
      id,
      await this.repository.update(id, {
        ...dto,
        startedAt,
        endedAt,
        durationMinutes: this.diffMinutes(startedAt, endedAt),
      }),
    );
  }

  async submit(id: string, user: JwtPayloadType): Promise<TimeLog> {
    const log = await this.requireById(id);
    const isOwner = log.userId === user.id;
    if (!isOwner && !(await this.isAdmin(user))) {
      const canManage = await this.projectsRepository.canManageProject(log.projectId, user.id);
      if (!canManage) {
        throw new ForbiddenException('Only the log owner or project manager can submit this log');
      }
    }
    if (log.status !== TimeLogStatus.DRAFT || !log.endedAt) {
      throw new BadRequestException('Only stopped draft logs can be submitted');
    }
    if (log.durationMinutes <= 0) {
      throw new BadRequestException('A time log must contain worked time');
    }
    return this.requireUpdated(
      id,
      await this.repository.update(id, {
        status: TimeLogStatus.SUBMITTED,
        rejectionReason: null,
      }),
    );
  }

  async approve(
    id: string,
    reviewer: JwtPayloadType,
  ): Promise<TimeLog> {
    const log = await this.requireById(id);
    await this.assertCanReview(log.projectId, reviewer);
    if (log.status !== TimeLogStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted logs can be approved');
    }
    const item = this.requireUpdated(
      id,
      await this.repository.update(id, {
        status: TimeLogStatus.APPROVED,
        reviewedById: reviewer.id,
        reviewedAt: new Date(),
        rejectionReason: null,
      }),
    );
    await this.syncTaskLoggedHours(log.taskId);
    return item;
  }

  async reject(
    id: string,
    reviewer: JwtPayloadType,
    dto: ReviewTimeLogDto,
  ): Promise<TimeLog> {
    const log = await this.requireById(id);
    await this.assertCanReview(log.projectId, reviewer);
    if (log.status !== TimeLogStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted logs can be rejected');
    }
    if (!dto.reason?.trim()) {
      throw new BadRequestException('A rejection reason is required');
    }
    return this.requireUpdated(
      id,
      await this.repository.update(id, {
        status: TimeLogStatus.REJECTED,
        reviewedById: reviewer.id,
        reviewedAt: new Date(),
        rejectionReason: dto.reason.trim(),
      }),
    );
  }

  async listMine(
    userId: string,
    query: TimeLogQueryDto,
  ) {
    return this.repository.findMany({
      paginationOptions: this.pagination(query),
      filters: this.filters(query, { userId }),
    });
  }

  async listTask(
    taskId: string,
    user: JwtPayloadType,
    query: TimeLogQueryDto,
  ) {
    await this.tasksService.findById(taskId, user);
    return this.repository.findMany({
      paginationOptions: this.pagination(query),
      filters: this.filters(query, { taskId }),
    });
  }

  async listTeam(
    user: JwtPayloadType,
    query: TimeLogQueryDto,
  ) {
    const isAdmin = await this.isAdmin(user);
    return this.repository.findMany({
      paginationOptions: this.pagination(query),
      filters: this.filters(query, {
        managedByUserId: isAdmin ? undefined : user.id,
        isAdmin,
      }),
    });
  }

  async report(
    user: JwtPayloadType,
    query: TimeLogQueryDto,
  ): Promise<TimeLogReportSummary> {
    const isAdmin = await this.isAdmin(user);
    return this.repository.getReportSummary(
      this.filters(query, {
        managedByUserId: isAdmin ? undefined : user.id,
        isAdmin,
      }),
    );
  }

  private async requireById(id: string): Promise<TimeLog> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Time log #${id} not found`);
    return item;
  }

  private async requireActiveTimer(userId: string): Promise<TimeLog> {
    const item = await this.repository.findActiveByUser(userId);
    if (!item) throw new NotFoundException('No active timer was found');
    return item;
  }

  private requireUpdated(id: string, item: TimeLog | null): TimeLog {
    if (!item) throw new NotFoundException(`Time log #${id} not found`);
    return item;
  }

  private async assertCanLogTask(
    task: { assigneeId: string | null; projectId: string },
    user: JwtPayloadType,
  ): Promise<void> {
    if (task.assigneeId === user.id || (await this.isAdmin(user))) return;
    if (await this.projectsRepository.isProjectParticipant(task.projectId, user.id)) return;
    throw new ForbiddenException(
      'Time can only be logged by the task assignee or a project team member',
    );
  }

  private async assertCanReview(
    projectId: string,
    user: JwtPayloadType,
  ): Promise<void> {
    if (
      (await this.isAdmin(user)) ||
      (await this.projectsRepository.canManageProject(projectId, user.id))
    ) {
      return;
    }
    throw new ForbiddenException(
      'Only the project manager, team leader, or admin can review time logs',
    );
  }

  private async isAdmin(user: JwtPayloadType): Promise<boolean> {
    if (
      String(user.role?.id) === RoleEnum.admin.toString() ||
      String(user.role?.name ?? '').toLowerCase() === 'admin'
    ) {
      return true;
    }
    const roles = await this.userRepository.getUserRoles(user.id);
    return roles.some(
      (role) =>
        String(role?.id) === RoleEnum.admin.toString() ||
        String(role?.name ?? '').toLowerCase() === 'admin',
    );
  }

  private async syncTaskLoggedHours(taskId: string): Promise<void> {
    const minutes = await this.repository.sumApprovedMinutesByTask(taskId);
    await this.tasksRepository.update(taskId, {
      loggedHours: Number((minutes / 60).toFixed(2)),
    });
  }

  private diffMinutes(from: Date, to: Date): number {
    return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 60000));
  }

  private assertValidRange(from: Date, to: Date): void {
    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime()) ||
      to <= from
    ) {
      throw new BadRequestException('End time must be after start time');
    }
    if (to > new Date()) {
      throw new BadRequestException('Time logs cannot end in the future');
    }
    if (this.diffMinutes(from, to) > 24 * 60) {
      throw new BadRequestException(
        'A single time log cannot exceed 24 hours',
      );
    }
  }

  private pagination(query: TimeLogQueryDto): IPaginationOptions {
    return { page: query.page ?? 1, limit: query.limit ?? 20 };
  }

  private filters(
    query: TimeLogQueryDto,
    overrides: Partial<TimeLogFilters> = {},
  ): TimeLogFilters {
    return {
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      projectId: query.projectId,
      taskId: query.taskId,
      userId: query.userId,
      status: query.status,
      ...overrides,
    };
  }
}

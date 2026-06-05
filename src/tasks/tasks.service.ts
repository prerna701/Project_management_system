import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepository } from './infrastructure/persistence/tasks.repository';
import { Task } from './domain/task';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { TaskPriority } from './enums/task-priority.enum';
import { TaskStatus } from './enums/task-status.enum';
import { TaskBillingType } from './enums/task-billing-type.enum';
import { MilestonesService } from '../milestones/milestones.service';
import { ProjectActivitiesService } from '../project-activities/project-activities.service';
import { ActivityAction } from '../project-activities/enums/activity-action.enum';
import { ActivityEntityType } from '../project-activities/enums/activity-entity-type.enum';

@Injectable()
export class TasksService {
  constructor(
    private readonly repository: TasksRepository,
    private readonly milestonesService: MilestonesService,
    private readonly activitiesService: ProjectActivitiesService,
  ) {}

  async findAll(
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    return this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
      search,
    });
  }

  async findByProject(
    projectId: string,
    paginationOptions?: IPaginationOptions,
    search?: string,
    withoutMilestone?: boolean,
  ): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    return this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 100 },
      search,
      projectId,
      withoutMilestone,
    });
  }

  async createForProject(projectId: string, dto: CreateTaskDto, actorId?: string): Promise<Task> {
    const item = await this.repository.create({
      ...this.buildTaskPayload(dto),
      projectId,
    });
    await this.logTaskCreated(item, actorId);
    return item;
  }

  async findByMilestone(
    milestoneId: string,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    return this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
      search,
      milestoneId,
    });
  }

  async findById(id: string): Promise<Task> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Task #${id} not found`);
    return item;
  }

  async createForMilestone(
    milestoneId: string,
    dto: CreateTaskDto & { projectId: string },
    actorId?: string,
  ): Promise<Task> {
    const item = await this.repository.create({
      ...this.buildTaskPayload(dto),
      projectId: dto.projectId,
      milestoneId,
    });
    await this.syncMilestoneCompletion(milestoneId);
    await this.logTaskCreated(item, actorId);
    return item;
  }

  async update(id: string, dto: UpdateTaskDto, actorId?: string): Promise<Task> {
    const existing = await this.findById(id);
    const payload: Partial<Task> = {
      ...dto,
      startDate: dto.startDate !== undefined ? (dto.startDate ? new Date(dto.startDate) : null) : undefined,
      dueDate: dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : undefined,
      actualEndDate:
        dto.actualEndDate !== undefined ? (dto.actualEndDate ? new Date(dto.actualEndDate) : null) : undefined,
    };
    const item = await this.repository.update(id, payload);
    if (!item) throw new NotFoundException(`Task #${id} not found`);
    await this.syncMilestoneCompletion(item.milestoneId ?? existing.milestoneId);
    if (dto.status && dto.status !== existing.status && actorId) {
      await this.repository.recordStatusChange({
        taskId: id,
        fromStatus: existing.status,
        toStatus: dto.status,
        changedBy: actorId,
        note: null,
      });
    }
    await this.logTaskUpdated(existing, item, dto, actorId);
    return item;
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const item = await this.findById(id);
    await this.repository.remove(id);
    await this.syncMilestoneCompletion(item.milestoneId);
    if (actorId) {
      await this.activitiesService.log({
        projectId: item.projectId,
        milestoneId: item.milestoneId,
        taskId: item.id,
        actorId,
        action: ActivityAction.DELETED,
        entityType: ActivityEntityType.TASK,
        entityId: item.id,
        title: 'Task deleted',
        description: `Task "${item.title}" was deleted`,
      });
    }
  }

  async assignTask(id: string, dto: AssignTaskDto, actorId?: string): Promise<Task> {
    const existing = await this.findById(id);
    const item = await this.repository.update(id, { assigneeId: dto.assigneeId });
    if (!item) throw new NotFoundException(`Task #${id} not found`);
    if (actorId) {
      await this.activitiesService.log({
        projectId: item.projectId,
        milestoneId: item.milestoneId,
        taskId: item.id,
        actorId,
        action: ActivityAction.ASSIGNED,
        entityType: ActivityEntityType.TASK,
        entityId: item.id,
        title: 'Task assigned',
        description: `Task "${item.title}" was assigned`,
        oldValue: existing.assigneeId,
        newValue: item.assigneeId,
      });
    }
    return item;
  }

  async assignToMilestone(id: string, milestoneId: string | null | undefined, actorId?: string): Promise<Task> {
    const task = await this.findById(id);
    const previousMilestoneId = task.milestoneId;

    if (milestoneId) {
      const milestone = await this.milestonesService.findById(milestoneId);
      if (milestone.projectId !== task.projectId) {
        throw new BadRequestException('Milestone does not belong to the same project as the task');
      }
    }

    const updated = await this.repository.update(id, { milestoneId: milestoneId ?? null });
    if (!updated) throw new NotFoundException(`Task #${id} not found`);

    if (previousMilestoneId) {
      await this.syncMilestoneCompletion(previousMilestoneId);
    }
    if (milestoneId) {
      await this.syncMilestoneCompletion(milestoneId);
    }

    if (actorId) {
      await this.activitiesService.log({
        projectId: task.projectId,
        milestoneId: milestoneId ?? null,
        taskId: task.id,
        actorId,
        action: ActivityAction.ASSIGNED,
        entityType: ActivityEntityType.TASK,
        entityId: task.id,
        title: milestoneId ? 'Task added to milestone' : 'Task removed from milestone',
        description: milestoneId
          ? `Task "${task.title}" was added to a milestone`
          : `Task "${task.title}" was removed from its milestone`,
        oldValue: previousMilestoneId,
        newValue: milestoneId ?? null,
      });
    }

    return updated;
  }

  async reassignOpenTasks(fromUserId: string, toUserId: string): Promise<void> {
    await this.repository.reassignOpenTasks(fromUserId, toUserId);
  }

  async getTaskCounts(projectId: string): Promise<{ total: number; completed: number }> {
    return this.repository.countByProjectId(projectId);
  }

  async getCompletionPercentage(projectId: string): Promise<number> {
    const { total, completed } = await this.repository.countByProjectId(projectId);
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  async getStatusHistory(taskId: string) {
    return this.repository.findStatusHistory(taskId);
  }

  async getMilestoneSummary(
    milestoneId: string,
  ): Promise<{ total: number; completed: number; completionPercentage: number; byStatus: Record<string, number> }> {
    const counts = await this.repository.countByMilestoneId(milestoneId);
    return {
      ...counts,
      completionPercentage: this.calculateCompletionPercentage(counts.total, counts.completed),
    };
  }

  private buildTaskPayload(dto: CreateTaskDto): Partial<Task> {
    const isBillable = dto.isBillable ?? dto.billingType === TaskBillingType.BILLABLE;

    return {
      title: dto.title,
      description: dto.description ?? null,
      teamId: dto.teamId ?? null,
      assigneeId: dto.assigneeId ?? null,
      reporterId: dto.reporterId ?? null,
      ownerId: dto.ownerId ?? dto.assigneeId ?? null,
      createdBy: dto.createdBy ?? null,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      status: dto.status ?? TaskStatus.OPEN,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      actualEndDate: dto.actualEndDate ? new Date(dto.actualEndDate) : null,
      estimatedHours: dto.estimatedHours ?? null,
      workHours: dto.workHours ?? dto.estimatedHours ?? null,
      loggedHours: dto.loggedHours ?? 0,
      timeLogTotal: dto.timeLogTotal ?? dto.loggedHours ?? 0,
      completionPercentage: dto.completionPercentage ?? (dto.status === TaskStatus.DONE ? 100 : 0),
      isBillable,
      billingType: dto.billingType ?? (isBillable ? TaskBillingType.BILLABLE : TaskBillingType.NON_BILLABLE),
      dependencies: dto.dependencies ?? [],
      attachments: dto.attachments ?? [],
      labels: dto.labels ?? [],
    };
  }

  private async syncMilestoneCompletion(milestoneId?: string | null): Promise<void> {
    if (!milestoneId) return;

    const { total, completed } = await this.repository.countByMilestoneId(milestoneId);
    await this.milestonesService.updateCompletionPercentage(
      milestoneId,
      this.calculateCompletionPercentage(total, completed),
    );
  }

  private calculateCompletionPercentage(total: number, completed: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  private async logTaskCreated(item: Task, actorId?: string): Promise<void> {
    if (!actorId) return;

    await this.activitiesService.log({
      projectId: item.projectId,
      milestoneId: item.milestoneId,
      taskId: item.id,
      actorId,
      action: ActivityAction.CREATED,
      entityType: ActivityEntityType.TASK,
      entityId: item.id,
      title: 'Task created',
      description: `Task "${item.title}" was created`,
    });
  }

  private async logTaskUpdated(
    existing: Task,
    item: Task,
    dto: UpdateTaskDto,
    actorId?: string,
  ): Promise<void> {
    if (!actorId) return;

    const statusChanged = dto.status && dto.status !== existing.status;

    await this.activitiesService.log({
      projectId: item.projectId,
      milestoneId: item.milestoneId,
      taskId: item.id,
      actorId,
      action: statusChanged ? ActivityAction.STATUS_CHANGED : ActivityAction.UPDATED,
      entityType: ActivityEntityType.TASK,
      entityId: item.id,
      title: statusChanged
        ? 'Task status changed'
        : 'Task updated',
      description: statusChanged
        ? `Task "${item.title}" changed from ${existing.status} to ${dto.status}`
        : `Task "${item.title}" was updated`,
      oldValue: statusChanged ? existing.status : null,
      newValue: statusChanged ? dto.status ?? null : null,
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { SubtasksRepository } from './infrastructure/persistence/subtasks.repository';
import { Subtask } from './domain/subtask';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { AssignSubtaskDto } from './dto/assign-subtask.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { TaskPriority } from '../tasks/enums/task-priority.enum';
import { TaskStatus } from '../tasks/enums/task-status.enum';
import { TaskBillingType } from '../tasks/enums/task-billing-type.enum';
import { ProjectActivitiesService } from '../project-activities/project-activities.service';
import { ActivityAction } from '../project-activities/enums/activity-action.enum';
import { ActivityEntityType } from '../project-activities/enums/activity-entity-type.enum';

@Injectable()
export class SubtasksService {
  constructor(
    private readonly repository: SubtasksRepository,
    private readonly activitiesService: ProjectActivitiesService,
  ) {}

  async findByTask(
    taskId: string,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Subtask[]; meta: PaginationMetaDto }> {
    return this.repository.findByTaskId(taskId, {
      paginationOptions: paginationOptions || { page: 1, limit: 50 },
      search,
    });
  }

  async findById(id: string): Promise<Subtask> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Subtask #${id} not found`);
    return item;
  }

  async create(
    taskId: string,
    projectId: string,
    dto: CreateSubtaskDto,
    actorId?: string,
  ): Promise<Subtask> {
    const item = await this.repository.create({
      taskId,
      projectId,
      title: dto.title,
      description: dto.description ?? null,
      notes: dto.notes ?? null,
      assigneeId: dto.assigneeId ?? null,
      ownerId: dto.assigneeId ?? null,
      createdBy: actorId ?? null,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      status: dto.status ?? TaskStatus.OPEN,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      workHours: dto.workHours ?? null,
      loggedHours: 0,
      completionPercentage: dto.completionPercentage ?? (dto.status === TaskStatus.DONE ? 100 : 0),
      isBillable: dto.isBillable ?? false,
      billingType: dto.billingType ?? TaskBillingType.NON_BILLABLE,
      dependencies: dto.dependencies ?? [],
      attachments: dto.attachments ?? [],
      labels: dto.labels ?? [],
      checklist: dto.checklist ?? [],
    });

    if (actorId) {
      await this.activitiesService.log({
        projectId,
        milestoneId: null,
        taskId,
        subtaskId: item.id,
        actorId,
        action: ActivityAction.CREATED,
        entityType: ActivityEntityType.SUBTASK,
        entityId: item.id,
        title: 'Subtask created',
        description: `Subtask "${item.title}" was created`,
      });
    }
    return item;
  }

  async update(id: string, dto: UpdateSubtaskDto, actorId?: string): Promise<Subtask> {
    const existing = await this.findById(id);
    const payload: Partial<Subtask> = {
      ...dto,
      startDate: dto.startDate !== undefined ? (dto.startDate ? new Date(dto.startDate) : null) : undefined,
      dueDate: dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : undefined,
    };
    const item = await this.repository.update(id, payload);
    if (!item) throw new NotFoundException(`Subtask #${id} not found`);

    if (actorId) {
      const statusChanged = dto.status && dto.status !== existing.status;
      await this.activitiesService.log({
        projectId: item.projectId,
        milestoneId: null,
        taskId: item.taskId,
        subtaskId: item.id,
        actorId,
        action: statusChanged ? ActivityAction.STATUS_CHANGED : ActivityAction.UPDATED,
        entityType: ActivityEntityType.SUBTASK,
        entityId: item.id,
        title: statusChanged ? 'Subtask status changed' : 'Subtask updated',
        description: statusChanged
          ? `Subtask "${item.title}" changed from ${existing.status} to ${dto.status}`
          : `Subtask "${item.title}" was updated`,
        oldValue: statusChanged ? existing.status : null,
        newValue: statusChanged ? (dto.status ?? null) : null,
      });
    }
    return item;
  }

  async assignSubtask(id: string, dto: AssignSubtaskDto, actorId?: string): Promise<Subtask> {
    const existing = await this.findById(id);
    const item = await this.repository.update(id, { assigneeId: dto.assigneeId ?? null });
    if (!item) throw new NotFoundException(`Subtask #${id} not found`);

    if (actorId) {
      await this.activitiesService.log({
        projectId: item.projectId,
        milestoneId: null,
        taskId: item.taskId,
        subtaskId: item.id,
        actorId,
        action: ActivityAction.ASSIGNED,
        entityType: ActivityEntityType.SUBTASK,
        entityId: item.id,
        title: 'Subtask assigned',
        description: `Subtask "${item.title}" was assigned`,
        oldValue: existing.assigneeId,
        newValue: item.assigneeId,
      });
    }
    return item;
  }

  async remove(id: string, actorId?: string): Promise<void> {
    const item = await this.findById(id);
    await this.repository.remove(id);

    if (actorId) {
      await this.activitiesService.log({
        projectId: item.projectId,
        milestoneId: null,
        taskId: item.taskId,
        subtaskId: item.id,
        actorId,
        action: ActivityAction.DELETED,
        entityType: ActivityEntityType.SUBTASK,
        entityId: item.id,
        title: 'Subtask deleted',
        description: `Subtask "${item.title}" was deleted`,
      });
    }
  }

  async getCountByTask(taskId: string): Promise<{ total: number; completed: number }> {
    return this.repository.countByTaskId(taskId);
  }
}

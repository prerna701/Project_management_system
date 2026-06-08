import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MilestonesRepository } from './infrastructure/persistence/milestones.repository';
import { Milestone } from './domain/milestone';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { MilestoneStatus } from './enums/milestone-status.enum';
import { ProjectActivitiesService } from '../project-activities/project-activities.service';
import { ActivityAction } from '../project-activities/enums/activity-action.enum';
import { ActivityEntityType } from '../project-activities/enums/activity-entity-type.enum';
import { TasksRepository } from '../tasks/infrastructure/persistence/tasks.repository';

@Injectable()
export class MilestonesService {
  constructor(
    
    private readonly repository: MilestonesRepository,
    private readonly activitiesService: ProjectActivitiesService,
    private readonly tasksRepository: TasksRepository,
  ) {}

  async findByProjectId(
    projectId: string,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Milestone[]; meta: PaginationMetaDto }> {
    return this.repository.findByProjectId(projectId, {
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
      search,
    });
  }

  async findById(id: string): Promise<Milestone> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Milestone #${id} not found`);
    return item;
  }

  async create(projectId: string, dto: CreateMilestoneDto, actorId?: string): Promise<Milestone> {
    const taskIds = this.getUniqueTaskIds(dto.taskIds);

    if (taskIds.length > 0) {
      await this.ensureTasksBelongToProject(projectId, taskIds);
    }

    const milestone = await this.repository.create({
      projectId,
      name: dto.name,
      description: dto.description ?? null,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      ownerId: dto.ownerId ?? null,
      status: dto.status ?? MilestoneStatus.PLANNED,
      completionPercentage: dto.completionPercentage ?? 0,
    });

    await this.tasksRepository.assignMilestoneToTasks(projectId, milestone.id, taskIds);

    return milestone;
  }

  async update(id: string, dto: UpdateMilestoneDto, actorId?: string): Promise<Milestone> {
    const existing = await this.findById(id);
    const payload: Partial<Milestone> = {
      ...dto,
      startDate: dto.startDate !== undefined ? (dto.startDate ? new Date(dto.startDate) : null) : undefined,
      dueDate: dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : undefined,
    };
    const item = await this.repository.update(id, payload);
    if (!item) throw new NotFoundException(`Milestone #${id} not found`);
    if (dto.status && dto.status !== existing.status && actorId) {
      await this.repository.recordStatusChange({
        milestoneId: id,
        fromStatus: existing.status,
        toStatus: dto.status,
        changedBy: actorId,
        note: null,
      });
    }
    if (actorId) {
      const statusChanged = dto.status && dto.status !== existing.status;
      await this.activitiesService.log({
        projectId: item.projectId,
        milestoneId: item.id,
        actorId,
        action: statusChanged ? ActivityAction.STATUS_CHANGED : ActivityAction.UPDATED,
        entityType: ActivityEntityType.MILESTONE,
        entityId: item.id,
        title: statusChanged ? 'Milestone status changed' : 'Milestone updated',
        description: statusChanged
          ? `Milestone "${item.name}" changed from ${existing.status} to ${dto.status}`
          : `Milestone "${item.name}" was updated`,
        oldValue: statusChanged ? existing.status : null,
        newValue: statusChanged ? dto.status ?? null : null,
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
        milestoneId: item.id,
        actorId,
        action: ActivityAction.DELETED,
        entityType: ActivityEntityType.MILESTONE,
        entityId: item.id,
        title: 'Milestone deleted',
        description: `Milestone "${item.name}" was deleted`,
      });
    }
  }

  async updateCompletionPercentage(
    id: string,
    completionPercentage: number,
  ): Promise<void> {
    await this.repository.update(id, { completionPercentage });
  }

  async getStatusHistory(milestoneId: string) {
    return this.repository.findStatusHistory(milestoneId);
  }

  private getUniqueTaskIds(taskIds: string[] = []): string[] {
    return [...new Set(taskIds)];
  }

  private async ensureTasksBelongToProject(
    projectId: string,
    taskIds: string[],
  ): Promise<void> {
    const matchingTaskIds = await this.tasksRepository.findProjectTaskIds(projectId, taskIds);

    if (matchingTaskIds.length !== taskIds.length) {
      const matching = new Set(matchingTaskIds);
      const invalidTaskIds = taskIds.filter((taskId) => !matching.has(taskId));
      throw new BadRequestException(
        `Tasks do not belong to project or were not found: ${invalidTaskIds.join(', ')}`,
      );
    }
  }
}

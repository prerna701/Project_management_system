import { Injectable } from '@nestjs/common';
import { ProjectActivitiesRepository } from './infrastructure/persistence/project-activities.repository';
import { ProjectActivity } from './domain/project-activity';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';

export interface LogActivityDto {
  projectId: string;
  milestoneId?: string | null;
  taskId?: string | null;
  subtaskId?: string | null;
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  title: string;
  description: string;
  oldValue?: string | null;
  newValue?: string | null;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ProjectActivitiesService {
  constructor(private readonly repository: ProjectActivitiesRepository) {}

  async log(dto: LogActivityDto): Promise<ProjectActivity> {
    return this.repository.log({
      projectId: dto.projectId,
      milestoneId: dto.milestoneId ?? null,
      taskId: dto.taskId ?? null,
      subtaskId: dto.subtaskId ?? null,
      actorId: dto.actorId,
      action: dto.action,
      entityType: dto.entityType,
      entityId: dto.entityId ?? null,
      title: dto.title,
      description: dto.description,
      oldValue: dto.oldValue ?? null,
      newValue: dto.newValue ?? null,
      metadata: dto.metadata ?? {},
    });
  }

  async findByProject(
    projectId: string,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: ProjectActivity[]; meta: PaginationMetaDto }> {
    return this.repository.findMany({
      paginationOptions: paginationOptions || { page: 1, limit: 20 },
      projectId,
    });
  }

  async findAll(
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: ProjectActivity[]; meta: PaginationMetaDto }> {
    return this.repository.findMany({
      paginationOptions: paginationOptions || { page: 1, limit: 20 },
    });
  }

  async findByMilestone(
    milestoneId: string,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: ProjectActivity[]; meta: PaginationMetaDto }> {
    return this.repository.findMany({
      paginationOptions: paginationOptions || { page: 1, limit: 20 },
      milestoneId,
    });
  }

  async findByTask(
    taskId: string,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: ProjectActivity[]; meta: PaginationMetaDto }> {
    return this.repository.findMany({
      paginationOptions: paginationOptions || { page: 1, limit: 20 },
      taskId,
    });
  }

  async findBySubtask(
    subtaskId: string,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: ProjectActivity[]; meta: PaginationMetaDto }> {
    return this.repository.findMany({
      paginationOptions: paginationOptions || { page: 1, limit: 20 },
      subtaskId,
    });
  }
}

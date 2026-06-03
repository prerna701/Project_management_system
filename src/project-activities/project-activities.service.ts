import { Injectable } from '@nestjs/common';
import { ProjectActivitiesRepository } from './infrastructure/persistence/project-activities.repository';
import { ProjectActivity } from './domain/project-activity';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';

export interface LogActivityDto {
  projectId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ProjectActivitiesService {
  constructor(private readonly repository: ProjectActivitiesRepository) {}

  async log(dto: LogActivityDto): Promise<ProjectActivity> {
    return this.repository.log({
      projectId: dto.projectId,
      actorId: dto.actorId,
      action: dto.action,
      entityType: dto.entityType,
      entityId: dto.entityId ?? null,
      description: dto.description,
      metadata: dto.metadata ?? {},
    });
  }

  async findByProject(
    projectId: string,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: ProjectActivity[]; meta: PaginationMetaDto }> {
    return this.repository.findByProjectId(projectId, {
      paginationOptions: paginationOptions || { page: 1, limit: 20 },
    });
  }
}

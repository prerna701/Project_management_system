import { Project } from '../../../../domain/project';
import { ProjectEntity } from '../entities/project.entity';

export class ProjectMapper {
  static toDomain(raw: ProjectEntity): Project {
    const item = new Project();
    item.id = raw.id;
    item.name = raw.name;
    item.code = raw.code;
    item.description = raw.description;
    item.clientName = raw.clientName;
    item.startDate = raw.startDate;
    item.endDate = raw.endDate;
    item.priority = raw.priority;
    item.visibility = raw.visibility;
    item.status = raw.status;
    item.isBillable = raw.isBillable;
    item.estimatedHours = raw.estimatedHours;
    item.budget = raw.budget;
    item.assignedTeamId = raw.assignedTeamId;
    item.projectManagerId = raw.projectManagerId;
    item.owner = null;          // enriched by service after DB fetch
    item.tags = raw.tags ?? [];
    item.attachments = raw.attachments ?? [];
    item.completedTasks = 0;    // enriched by service after DB fetch
    item.totalTasks = 0;        // enriched by service after DB fetch
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<Project>): Partial<ProjectEntity> {
    const entity: Partial<ProjectEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.name !== undefined) entity.name = item.name;
    if (item.code !== undefined) entity.code = item.code ?? null;
    if (item.description !== undefined) entity.description = item.description ?? null;
    if (item.clientName !== undefined) entity.clientName = item.clientName ?? null;
    if (item.startDate !== undefined) entity.startDate = item.startDate ?? null;
    if (item.endDate !== undefined) entity.endDate = item.endDate ?? null;
    if (item.priority !== undefined) entity.priority = item.priority;
    if (item.visibility !== undefined) entity.visibility = item.visibility;
    if (item.status !== undefined) entity.status = item.status;
    if (item.isBillable !== undefined) entity.isBillable = item.isBillable;
    if (item.estimatedHours !== undefined) entity.estimatedHours = item.estimatedHours ?? null;
    if (item.budget !== undefined) entity.budget = item.budget ?? null;
    if (item.assignedTeamId !== undefined) entity.assignedTeamId = item.assignedTeamId ?? null;
    if (item.projectManagerId !== undefined) entity.projectManagerId = item.projectManagerId ?? null;
    if (item.tags !== undefined) entity.tags = item.tags ?? [];
    if (item.attachments !== undefined) entity.attachments = item.attachments ?? [];
    return entity;
  }
}

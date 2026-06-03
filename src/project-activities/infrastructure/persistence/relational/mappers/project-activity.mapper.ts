import { ProjectActivity } from '../../../../domain/project-activity';
import { ProjectActivityEntity } from '../entities/project-activity.entity';

export class ProjectActivityMapper {
  static toDomain(raw: ProjectActivityEntity): ProjectActivity {
    const item = new ProjectActivity();
    item.id = raw.id;
    item.projectId = raw.projectId;
    item.actorId = raw.actorId;
    item.action = raw.action;
    item.entityType = raw.entityType;
    item.entityId = raw.entityId;
    item.description = raw.description;
    item.metadata = raw.metadata;
    item.createdAt = raw.createdAt;
    return item;
  }

  static toPersistence(item: Partial<ProjectActivity>): Partial<ProjectActivityEntity> {
    const entity: Partial<ProjectActivityEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.projectId !== undefined) entity.projectId = item.projectId;
    if (item.actorId !== undefined) entity.actorId = item.actorId;
    if (item.action !== undefined) entity.action = item.action;
    if (item.entityType !== undefined) entity.entityType = item.entityType;
    if (item.entityId !== undefined) entity.entityId = item.entityId ?? null;
    if (item.description !== undefined) entity.description = item.description;
    if (item.metadata !== undefined) entity.metadata = item.metadata;
    return entity;
  }
}

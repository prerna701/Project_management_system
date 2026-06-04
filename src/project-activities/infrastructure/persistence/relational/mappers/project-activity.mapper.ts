import { ProjectActivity } from '../../../../domain/project-activity';
import { ProjectActivityEntity } from '../entities/project-activity.entity';

export class ProjectActivityMapper {
  static toDomain(raw: ProjectActivityEntity): ProjectActivity {
    const item = new ProjectActivity();
    item.id = raw.id;
    item.projectId = raw.projectId;
    item.milestoneId = raw.milestoneId;
    item.taskId = raw.taskId;
    item.subtaskId = raw.subtaskId;
    item.actorId = raw.actorId;
    item.action = raw.action;
    item.entityType = raw.entityType;
    item.entityId = raw.entityId;
    item.title = raw.title;
    item.description = raw.description;
    item.oldValue = raw.oldValue;
    item.newValue = raw.newValue;
    item.metadata = raw.metadata;
    item.createdAt = raw.createdAt;
    return item;
  }

  static toPersistence(item: Partial<ProjectActivity>): Partial<ProjectActivityEntity> {
    const entity: Partial<ProjectActivityEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.projectId !== undefined) entity.projectId = item.projectId;
    if (item.milestoneId !== undefined) entity.milestoneId = item.milestoneId ?? null;
    if (item.taskId !== undefined) entity.taskId = item.taskId ?? null;
    if (item.subtaskId !== undefined) entity.subtaskId = item.subtaskId ?? null;
    if (item.actorId !== undefined) entity.actorId = item.actorId;
    if (item.action !== undefined) entity.action = item.action;
    if (item.entityType !== undefined) entity.entityType = item.entityType;
    if (item.entityId !== undefined) entity.entityId = item.entityId ?? null;
    if (item.title !== undefined) entity.title = item.title;
    if (item.description !== undefined) entity.description = item.description;
    if (item.oldValue !== undefined) entity.oldValue = item.oldValue ?? null;
    if (item.newValue !== undefined) entity.newValue = item.newValue ?? null;
    if (item.metadata !== undefined) entity.metadata = item.metadata;
    return entity;
  }
}

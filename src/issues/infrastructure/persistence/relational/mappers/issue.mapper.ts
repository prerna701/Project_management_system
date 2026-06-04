import { Issue } from '../../../../domain/issue';
import { IssueEntity } from '../entities/issue.entity';

export class IssueMapper {
  static toDomain(raw: IssueEntity): Issue {
    const item = new Issue();
    item.id = raw.id;
    item.projectId = raw.projectId;
    item.milestoneId = raw.milestoneId;
    item.taskId = raw.taskId;
    item.subtaskId = raw.subtaskId;
    item.title = raw.title;
    item.description = raw.description;
    item.status = raw.status;
    item.raisedBy = raw.raisedBy;
    item.assignedToId = raw.assignedToId;
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    return item;
  }

  static toPersistence(item: Partial<Issue>): Partial<IssueEntity> {
    const entity: Partial<IssueEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.projectId !== undefined) entity.projectId = item.projectId;
    if (item.milestoneId !== undefined) entity.milestoneId = item.milestoneId ?? null;
    if (item.taskId !== undefined) entity.taskId = item.taskId ?? null;
    if (item.subtaskId !== undefined) entity.subtaskId = item.subtaskId ?? null;
    if (item.title !== undefined) entity.title = item.title;
    if (item.description !== undefined) entity.description = item.description ?? null;
    if (item.status !== undefined) entity.status = item.status;
    if (item.raisedBy !== undefined) entity.raisedBy = item.raisedBy;
    if (item.assignedToId !== undefined) entity.assignedToId = item.assignedToId ?? null;
    return entity;
  }
}

import { ProjectComment } from '../../../../domain/project-comment';
import { ProjectCommentEntity } from '../entities/project-comment.entity';

export class ProjectCommentMapper {
  static toDomain(raw: ProjectCommentEntity): ProjectComment {
    const item = new ProjectComment();
    item.id = raw.id;
    item.projectId = raw.projectId;
    item.milestoneId = raw.milestoneId;
    item.parentCommentId = raw.parentCommentId;
    item.userId = raw.userId;
    item.content = raw.content;
    item.mentions = raw.mentions ?? [];
    item.attachments = raw.attachments ?? [];
    item.isEdited = raw.isEdited;
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<ProjectComment>): Partial<ProjectCommentEntity> {
    const entity: Partial<ProjectCommentEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.projectId !== undefined) entity.projectId = item.projectId;
    if (item.milestoneId !== undefined) entity.milestoneId = item.milestoneId ?? null;
    if (item.parentCommentId !== undefined) entity.parentCommentId = item.parentCommentId ?? null;
    if (item.userId !== undefined) entity.userId = item.userId;
    if (item.content !== undefined) entity.content = item.content;
    if (item.mentions !== undefined) entity.mentions = item.mentions ?? [];
    if (item.attachments !== undefined) entity.attachments = item.attachments ?? [];
    if (item.isEdited !== undefined) entity.isEdited = item.isEdited;
    return entity;
  }
}

import { ProjectComment } from '../../../../domain/project-comment';
import { ProjectCommentEntity } from '../entities/project-comment.entity';

export class ProjectCommentMapper {
  static toDomain(raw: ProjectCommentEntity): ProjectComment {
    const item = new ProjectComment();
    item.id = raw.id;
    item.projectId = raw.projectId;
    item.userId = raw.userId;
    item.content = raw.content;
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<ProjectComment>): Partial<ProjectCommentEntity> {
    const entity: Partial<ProjectCommentEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.projectId !== undefined) entity.projectId = item.projectId;
    if (item.userId !== undefined) entity.userId = item.userId;
    if (item.content !== undefined) entity.content = item.content;
    return entity;
  }
}

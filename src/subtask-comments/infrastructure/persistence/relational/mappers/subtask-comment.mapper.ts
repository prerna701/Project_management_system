import { SubtaskComment } from '../../../../domain/subtask-comment';
import { SubtaskCommentEntity } from '../entities/subtask-comment.entity';

export class SubtaskCommentMapper {
  static toDomain(raw: SubtaskCommentEntity): SubtaskComment {
    const item = new SubtaskComment();
    item.id = raw.id;
    item.subtaskId = raw.subtaskId;
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

  static toPersistence(item: Partial<SubtaskComment>): Partial<SubtaskCommentEntity> {
    const entity: Partial<SubtaskCommentEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.subtaskId !== undefined) entity.subtaskId = item.subtaskId;
    if (item.parentCommentId !== undefined) entity.parentCommentId = item.parentCommentId ?? null;
    if (item.userId !== undefined) entity.userId = item.userId;
    if (item.content !== undefined) entity.content = item.content;
    if (item.mentions !== undefined) entity.mentions = item.mentions ?? [];
    if (item.attachments !== undefined) entity.attachments = item.attachments ?? [];
    if (item.isEdited !== undefined) entity.isEdited = item.isEdited;
    return entity;
  }
}

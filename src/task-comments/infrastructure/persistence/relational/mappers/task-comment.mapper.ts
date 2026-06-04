import { TaskComment } from '../../../../domain/task-comment';
import { TaskCommentEntity } from '../entities/task-comment.entity';

export class TaskCommentMapper {
  static toDomain(raw: TaskCommentEntity): TaskComment {
    const item = new TaskComment();
    item.id = raw.id;
    item.taskId = raw.taskId;
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

  static toPersistence(item: Partial<TaskComment>): Partial<TaskCommentEntity> {
    const entity: Partial<TaskCommentEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.taskId !== undefined) entity.taskId = item.taskId;
    if (item.parentCommentId !== undefined) entity.parentCommentId = item.parentCommentId ?? null;
    if (item.userId !== undefined) entity.userId = item.userId;
    if (item.content !== undefined) entity.content = item.content;
    if (item.mentions !== undefined) entity.mentions = item.mentions ?? [];
    if (item.attachments !== undefined) entity.attachments = item.attachments ?? [];
    if (item.isEdited !== undefined) entity.isEdited = item.isEdited;
    return entity;
  }
}

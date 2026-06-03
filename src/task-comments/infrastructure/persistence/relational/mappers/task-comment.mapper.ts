import { TaskComment } from '../../../../domain/task-comment';
import { TaskCommentEntity } from '../entities/task-comment.entity';

export class TaskCommentMapper {
  static toDomain(raw: TaskCommentEntity): TaskComment {
    const item = new TaskComment();
    item.id = raw.id;
    item.taskId = raw.taskId;
    item.userId = raw.userId;
    item.content = raw.content;
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<TaskComment>): Partial<TaskCommentEntity> {
    const entity: Partial<TaskCommentEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.taskId !== undefined) entity.taskId = item.taskId;
    if (item.userId !== undefined) entity.userId = item.userId;
    if (item.content !== undefined) entity.content = item.content;
    return entity;
  }
}

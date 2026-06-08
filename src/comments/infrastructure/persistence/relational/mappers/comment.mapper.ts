import { Comment } from '../../../../domain/comment';
import { CommentEntity } from '../entities/comment.entity';
import { CommentableEntity } from '../../../../enums/commentable-entity.enum';

export class CommentMapper {
  static toDomain(raw: CommentEntity): Comment {
    const item = new Comment();
    item.id = raw.id;
    item.entityType = raw.entityType as CommentableEntity;
    item.entityId = raw.entityId;
    item.authorId = raw.authorId;
    item.content = raw.content;
    item.isEdited = raw.isEdited;
    item.editedAt = raw.editedAt;
    item.mentions = raw.mentions ?? [];
    item.parentId = raw.parentId;
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<Comment>): Partial<CommentEntity> {
    const entity: Partial<CommentEntity> = {};
    if (item.id !== undefined) entity.id = item.id;
    if (item.entityType !== undefined) entity.entityType = item.entityType;
    if (item.entityId !== undefined) entity.entityId = item.entityId;
    if (item.authorId !== undefined) entity.authorId = item.authorId;
    if (item.content !== undefined) entity.content = item.content;
    if (item.isEdited !== undefined) entity.isEdited = item.isEdited;
    if (item.editedAt !== undefined) entity.editedAt = item.editedAt ?? null;
    if (item.mentions !== undefined) entity.mentions = item.mentions ?? [];
    if (item.parentId !== undefined) entity.parentId = item.parentId ?? null;
    return entity;
  }
}

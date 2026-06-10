import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsRepository } from './infrastructure/persistence/comments.repository';
import { Comment } from './domain/comment';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentableEntity } from './enums/commentable-entity.enum';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { TasksService } from '../tasks/tasks.service';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';

@Injectable()
export class CommentsService {
  constructor(
    private readonly repository: CommentsRepository,
    private readonly notificationsService: NotificationsService,
    private readonly tasksService: TasksService,
  ) {}

  async create(
    authorId: string,
    dto: CreateCommentDto,
    currentUser?: JwtPayloadType,
  ): Promise<Comment> {
    if (
      currentUser &&
      (dto.entityType === CommentableEntity.TASK ||
        dto.entityType === CommentableEntity.SUBTASK)
    ) {
      await this.tasksService.findById(dto.entityId, currentUser);
    }
    const comment = await this.repository.create({
      entityType: dto.entityType,
      entityId: dto.entityId,
      authorId,
      content: dto.content,
      isEdited: false,
      editedAt: null,
      mentions: dto.mentions ?? [],
      parentId: dto.parentId ?? null,
    });

    // Fire mention notifications (non-blocking)
    if (dto.mentions?.length) {
      this.notificationsService
        .notifyCommentMentions({
          mentionedUserIds: dto.mentions,
          authorId,
          entityType: dto.entityType,
          entityId: dto.entityId,
          commentId: comment.id,
        })
        .catch(() => undefined);
    }

    // Fire reply notification when parent comment exists
    if (dto.parentId) {
      this.repository.findById(dto.parentId).then((parent) => {
        if (parent) {
          this.notificationsService
            .notifyCommentReply({
              parentAuthorId: parent.authorId,
              replyAuthorId: authorId,
              entityType: dto.entityType,
              entityId: dto.entityId,
              commentId: comment.id,
            })
            .catch(() => undefined);
        }
      });
    }

    return comment;
  }

  async findByEntity(
    entityType: CommentableEntity,
    entityId: string,
    paginationOptions: IPaginationOptions,
    parentId?: string | null,
  ): Promise<{ items: Comment[]; meta: PaginationMetaDto }> {
    return this.repository.findByEntity({
      entityType,
      entityId,
      paginationOptions,
      parentId,
    });
  }

  async findById(id: string): Promise<Comment> {
    const comment = await this.repository.findById(id);
    if (!comment) throw new NotFoundException(`Comment #${id} not found`);
    return comment;
  }

  async update(id: string, authorId: string, dto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findById(id);

    if (comment.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const updated = await this.repository.update(id, {
      content: dto.content,
      mentions: dto.mentions ?? comment.mentions,
      isEdited: true,
      editedAt: new Date(),
    });

    if (!updated) throw new NotFoundException(`Comment #${id} not found`);
    return updated;
  }

  async remove(id: string, authorId: string, isAdmin: boolean): Promise<void> {
    const comment = await this.findById(id);

    if (!isAdmin && comment.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.repository.remove(id);
  }

  async findMilestoneComments(
    milestoneId: string,
    paginationOptions: IPaginationOptions,
  ): Promise<{ items: Comment[]; meta: PaginationMetaDto }> {
    return this.findByEntity(CommentableEntity.MILESTONE, milestoneId, paginationOptions);
  }

  async findTaskComments(
    taskId: string,
    paginationOptions: IPaginationOptions,
    currentUser: JwtPayloadType,
  ): Promise<{ items: Comment[]; meta: PaginationMetaDto }> {
    await this.tasksService.findById(taskId, currentUser);
    return this.findByEntity(CommentableEntity.TASK, taskId, paginationOptions);
  }

  async findSubtaskComments(
    subtaskId: string,
    paginationOptions: IPaginationOptions,
    currentUser: JwtPayloadType,
  ): Promise<{ items: Comment[]; meta: PaginationMetaDto }> {
    await this.tasksService.findById(subtaskId, currentUser);
    return this.findByEntity(CommentableEntity.SUBTASK, subtaskId, paginationOptions);
  }
}

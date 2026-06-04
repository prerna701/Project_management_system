import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SubtaskCommentsRepository } from './infrastructure/persistence/subtask-comments.repository';
import { SubtaskComment } from './domain/subtask-comment';
import { CreateSubtaskCommentDto } from './dto/create-subtask-comment.dto';
import { UpdateSubtaskCommentDto } from './dto/update-subtask-comment.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { SubtasksService } from '../subtasks/subtasks.service';
import { ProjectActivitiesService } from '../project-activities/project-activities.service';
import { ActivityAction } from '../project-activities/enums/activity-action.enum';
import { ActivityEntityType } from '../project-activities/enums/activity-entity-type.enum';
import { CommentsService } from '../comments/comments.service';

@Injectable()
export class SubtaskCommentsService {
  constructor(
    private readonly repository: SubtaskCommentsRepository,
    private readonly subtasksService: SubtasksService,
    private readonly activitiesService: ProjectActivitiesService,
    private readonly commentsService: CommentsService,
  ) {}

  async findBySubtask(
    subtaskId: string,
    userId: string,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: SubtaskComment[]; meta: PaginationMetaDto }> {
    const subtask = await this.subtasksService.findById(subtaskId);
    await this.commentsService.assertCanAccessProjectComments(subtask.projectId, userId, 'browse');
    return this.repository.findBySubtaskId(subtaskId, {
      paginationOptions: paginationOptions || { page: 1, limit: 20 },
    });
  }

  async findById(id: string): Promise<SubtaskComment> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Subtask comment #${id} not found`);
    return item;
  }

  async create(subtaskId: string, userId: string, dto: CreateSubtaskCommentDto): Promise<SubtaskComment> {
    const subtask = await this.subtasksService.findById(subtaskId);
    await this.commentsService.assertCanAccessProjectComments(subtask.projectId, userId, 'add');
    if (dto.mentions?.length) {
      await this.commentsService.assertCanAccessProjectComments(subtask.projectId, userId, 'mention');
      await this.commentsService.assertMentionedUsersBelongToProject(subtask.projectId, dto.mentions);
    }
    const item = await this.repository.create({
      subtaskId,
      userId,
      content: dto.content,
      mentions: dto.mentions ?? [],
      attachments: dto.attachments ?? [],
      parentCommentId: null,
      isEdited: false,
    });
    await this.activitiesService.log({
      projectId: subtask.projectId,
      milestoneId: null,
      taskId: subtask.taskId,
      subtaskId: subtask.id,
      actorId: userId,
      action: ActivityAction.COMMENT_ADDED,
      entityType: ActivityEntityType.COMMENT,
      entityId: item.id,
      title: 'Subtask comment added',
      description: `A comment was added to subtask "${subtask.title}"`,
      metadata: { commentId: item.id },
    });
    return item;
  }

  async reply(id: string, userId: string, dto: CreateSubtaskCommentDto): Promise<SubtaskComment> {
    const parent = await this.findById(id);
    const subtask = await this.subtasksService.findById(parent.subtaskId);
    await this.commentsService.assertCanAccessProjectComments(subtask.projectId, userId, 'reply');
    if (dto.mentions?.length) {
      await this.commentsService.assertCanAccessProjectComments(subtask.projectId, userId, 'mention');
      await this.commentsService.assertMentionedUsersBelongToProject(subtask.projectId, dto.mentions);
    }
    const item = await this.repository.create({
      subtaskId: parent.subtaskId,
      parentCommentId: parent.id,
      userId,
      content: dto.content,
      mentions: dto.mentions ?? [],
      attachments: dto.attachments ?? [],
      isEdited: false,
    });
    await this.activitiesService.log({
      projectId: subtask.projectId,
      milestoneId: null,
      taskId: subtask.taskId,
      subtaskId: subtask.id,
      actorId: userId,
      action: ActivityAction.COMMENT_ADDED,
      entityType: ActivityEntityType.COMMENT,
      entityId: item.id,
      title: 'Subtask comment replied',
      description: `A reply was added to subtask "${subtask.title}"`,
      metadata: { commentId: item.id, parentCommentId: parent.id },
    });
    return item;
  }

  async update(id: string, userId: string, dto: UpdateSubtaskCommentDto): Promise<SubtaskComment> {
    const comment = await this.findById(id);
    const subtask = await this.subtasksService.findById(comment.subtaskId);
    const canEditAny = await this.commentsService.canAccessProjectComments(subtask.projectId, userId, 'edit');
    if (comment.userId !== userId && !canEditAny) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    if (dto.mentions?.length) {
      await this.commentsService.assertMentionedUsersBelongToProject(subtask.projectId, dto.mentions);
    }
    const item = await this.repository.update(id, {
      content: dto.content,
      mentions: dto.mentions ?? comment.mentions,
      attachments: dto.attachments ?? comment.attachments,
      isEdited: true,
    });
    if (!item) throw new NotFoundException(`Subtask comment #${id} not found`);
    return item;
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.findById(id);
    const subtask = await this.subtasksService.findById(comment.subtaskId);
    const canDeleteAny = await this.commentsService.canAccessProjectComments(subtask.projectId, userId, 'delete');
    if (comment.userId !== userId && !canDeleteAny) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    await this.repository.remove(id);
  }
}

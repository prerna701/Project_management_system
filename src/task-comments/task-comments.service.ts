import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskCommentsRepository } from './infrastructure/persistence/task-comments.repository';
import { TaskComment } from './domain/task-comment';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { TasksService } from '../tasks/tasks.service';
import { ProjectActivitiesService } from '../project-activities/project-activities.service';
import { ActivityAction } from '../project-activities/enums/activity-action.enum';
import { ActivityEntityType } from '../project-activities/enums/activity-entity-type.enum';
import { CommentsService } from '../comments/comments.service';

@Injectable()
export class TaskCommentsService {
  constructor(
    private readonly repository: TaskCommentsRepository,
    private readonly tasksService: TasksService,
    private readonly activitiesService: ProjectActivitiesService,
    private readonly commentsService: CommentsService,
  ) {}

  async findByTask(
    taskId: string,
    userId: string,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: TaskComment[]; meta: PaginationMetaDto }> {
    const task = await this.tasksService.findById(taskId);
    await this.commentsService.assertCanAccessProjectComments(task.projectId, userId, 'browse');
    return this.repository.findByTaskId(taskId, {
      paginationOptions: paginationOptions || { page: 1, limit: 20 },
    });
  }

  async findById(id: string): Promise<TaskComment> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Task comment #${id} not found`);
    return item;
  }

  async create(taskId: string, userId: string, dto: CreateTaskCommentDto): Promise<TaskComment> {
    const task = await this.tasksService.findById(taskId);
    await this.commentsService.assertCanAccessProjectComments(task.projectId, userId, 'add');
    await this.assertCanMention(task.projectId, userId, dto.mentions);
    const item = await this.repository.create({
      taskId,
      userId,
      content: dto.content,
      mentions: dto.mentions ?? [],
      attachments: dto.attachments ?? [],
      parentCommentId: null,
      isEdited: false,
    });
    await this.activitiesService.log({
      projectId: task.projectId,
      milestoneId: task.milestoneId,
      taskId: task.id,
      actorId: userId,
      action: ActivityAction.COMMENT_ADDED,
      entityType: ActivityEntityType.COMMENT,
      entityId: item.id,
      title: 'Task comment added',
      description: `A comment was added to task "${task.title}"`,
      metadata: { commentId: item.id },
    });
    return item;
  }

  async reply(id: string, userId: string, dto: CreateTaskCommentDto): Promise<TaskComment> {
    const parent = await this.findById(id);
    const task = await this.tasksService.findById(parent.taskId);
    await this.commentsService.assertCanAccessProjectComments(task.projectId, userId, 'reply');
    await this.assertCanMention(task.projectId, userId, dto.mentions);
    const item = await this.repository.create({
      taskId: parent.taskId,
      parentCommentId: parent.id,
      userId,
      content: dto.content,
      mentions: dto.mentions ?? [],
      attachments: dto.attachments ?? [],
      isEdited: false,
    });

    await this.activitiesService.log({
      projectId: task.projectId,
      milestoneId: task.milestoneId,
      taskId: task.id,
      actorId: userId,
      action: ActivityAction.COMMENT_ADDED,
      entityType: ActivityEntityType.COMMENT,
      entityId: item.id,
      title: 'Task comment replied',
      description: `A reply was added to task "${task.title}"`,
      metadata: { commentId: item.id, parentCommentId: parent.id },
    });
    return item;
  }

  async update(id: string, userId: string, dto: UpdateTaskCommentDto): Promise<TaskComment> {
    const comment = await this.findById(id);
    const task = await this.tasksService.findById(comment.taskId);
    const canEditAny = await this.commentsService.canAccessProjectComments(task.projectId, userId, 'edit');
    if (comment.userId !== userId && !canEditAny) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    await this.assertCanMention(task.projectId, userId, dto.mentions);
    const item = await this.repository.update(id, {
      content: dto.content,
      mentions: dto.mentions ?? comment.mentions,
      attachments: dto.attachments ?? comment.attachments,
      isEdited: true,
    });
    if (!item) throw new NotFoundException(`Task comment #${id} not found`);
    return item;
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.findById(id);
    const task = await this.tasksService.findById(comment.taskId);
    const canDeleteAny = await this.commentsService.canAccessProjectComments(task.projectId, userId, 'delete');
    if (comment.userId !== userId && !canDeleteAny) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    await this.repository.remove(id);
  }

  private async assertCanMention(projectId: string, userId: string, mentions?: string[]): Promise<void> {
    if (!mentions?.length) return;
    await this.commentsService.assertCanAccessProjectComments(projectId, userId, 'mention');
    await this.commentsService.assertMentionedUsersBelongToProject(projectId, mentions);
  }
}

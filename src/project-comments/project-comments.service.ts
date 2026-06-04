import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectCommentsRepository } from './infrastructure/persistence/project-comments.repository';
import { ProjectComment } from './domain/project-comment';
import { CreateProjectCommentDto } from './dto/create-project-comment.dto';
import { UpdateProjectCommentDto } from './dto/update-project-comment.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { ProjectActivitiesService } from '../project-activities/project-activities.service';
import { ActivityAction } from '../project-activities/enums/activity-action.enum';
import { ActivityEntityType } from '../project-activities/enums/activity-entity-type.enum';
import { CommentsService } from '../comments/comments.service';
import { MilestonesService } from '../milestones/milestones.service';

@Injectable()
export class ProjectCommentsService {
  constructor(
    private readonly repository: ProjectCommentsRepository,
    private readonly activitiesService: ProjectActivitiesService,
    private readonly commentsService: CommentsService,
    private readonly milestonesService: MilestonesService,
  ) {}

  async findByProject(
    projectId: string,
    userId: string,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: ProjectComment[]; meta: PaginationMetaDto }> {
    await this.commentsService.assertCanAccessProjectComments(projectId, userId, 'browse');
    return this.repository.findByProjectId(projectId, {
      paginationOptions: paginationOptions || { page: 1, limit: 20 },
    });
  }

  async findByMilestone(
    milestoneId: string,
    userId: string,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: ProjectComment[]; meta: PaginationMetaDto }> {
    const milestone = await this.milestonesService.findById(milestoneId);
    await this.commentsService.assertCanAccessProjectComments(milestone.projectId, userId, 'browse');
    return this.repository.findByMilestoneId(milestoneId, {
      paginationOptions: paginationOptions || { page: 1, limit: 20 },
    });
  }

  async findById(id: string): Promise<ProjectComment> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Comment #${id} not found`);
    return item;
  }

  async create(projectId: string, userId: string, dto: CreateProjectCommentDto): Promise<ProjectComment> {
    await this.commentsService.assertCanAccessProjectComments(projectId, userId, 'add');
    await this.assertCanMention(projectId, userId, dto.mentions);
    const item = await this.repository.create({
      projectId,
      userId,
      content: dto.content,
      mentions: dto.mentions ?? [],
      attachments: dto.attachments ?? [],
      parentCommentId: null,
      milestoneId: null,
      isEdited: false,
    });
    await this.activitiesService.log({
      projectId,
      actorId: userId,
      action: ActivityAction.COMMENT_ADDED,
      entityType: ActivityEntityType.COMMENT,
      entityId: item.id,
      title: 'Project comment added',
      description: 'A comment was added to the project',
      metadata: { commentId: item.id },
    });
    return item;
  }

  async createForMilestone(
    milestoneId: string,
    userId: string,
    dto: CreateProjectCommentDto,
  ): Promise<ProjectComment> {
    const milestone = await this.milestonesService.findById(milestoneId);
    await this.commentsService.assertCanAccessProjectComments(milestone.projectId, userId, 'add');
    await this.assertCanMention(milestone.projectId, userId, dto.mentions);

    const item = await this.repository.create({
      projectId: milestone.projectId,
      milestoneId,
      userId,
      content: dto.content,
      mentions: dto.mentions ?? [],
      attachments: dto.attachments ?? [],
      parentCommentId: null,
      isEdited: false,
    });
    await this.activitiesService.log({
      projectId: milestone.projectId,
      milestoneId,
      actorId: userId,
      action: ActivityAction.COMMENT_ADDED,
      entityType: ActivityEntityType.COMMENT,
      entityId: item.id,
      title: 'Milestone comment added',
      description: `A comment was added to milestone "${milestone.name}"`,
      metadata: { commentId: item.id },
    });
    return item;
  }

  async reply(id: string, userId: string, dto: CreateProjectCommentDto): Promise<ProjectComment> {
    const parent = await this.findById(id);
    await this.commentsService.assertCanAccessProjectComments(parent.projectId, userId, 'reply');
    await this.assertCanMention(parent.projectId, userId, dto.mentions);

    const item = await this.repository.create({
      projectId: parent.projectId,
      milestoneId: parent.milestoneId,
      parentCommentId: parent.id,
      userId,
      content: dto.content,
      mentions: dto.mentions ?? [],
      attachments: dto.attachments ?? [],
      isEdited: false,
    });
    await this.activitiesService.log({
      projectId: item.projectId,
      milestoneId: item.milestoneId,
      actorId: userId,
      action: ActivityAction.COMMENT_ADDED,
      entityType: ActivityEntityType.COMMENT,
      entityId: item.id,
      title: item.milestoneId ? 'Milestone comment replied' : 'Project comment replied',
      description: 'A reply was added to a comment',
      metadata: { commentId: item.id, parentCommentId: parent.id },
    });
    return item;
  }

  async update(id: string, userId: string, dto: UpdateProjectCommentDto): Promise<ProjectComment> {
    const comment = await this.findById(id);
    const canEditAny = await this.commentsService.canAccessProjectComments(comment.projectId, userId, 'edit');
    if (comment.userId !== userId && !canEditAny) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    await this.assertCanMention(comment.projectId, userId, dto.mentions);
    const item = await this.repository.update(id, {
      content: dto.content,
      mentions: dto.mentions ?? comment.mentions,
      attachments: dto.attachments ?? comment.attachments,
      isEdited: true,
    });
    if (!item) throw new NotFoundException(`Comment #${id} not found`);
    return item;
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.findById(id);
    const canDeleteAny = await this.commentsService.canAccessProjectComments(comment.projectId, userId, 'delete');
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

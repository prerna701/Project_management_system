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

@Injectable()
export class ProjectCommentsService {
  constructor(
    private readonly repository: ProjectCommentsRepository,
    private readonly activitiesService: ProjectActivitiesService,
  ) {}

  async findByProject(
    projectId: string,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: ProjectComment[]; meta: PaginationMetaDto }> {
    return this.repository.findByProjectId(projectId, {
      paginationOptions: paginationOptions || { page: 1, limit: 20 },
    });
  }

  async findById(id: string): Promise<ProjectComment> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Comment #${id} not found`);
    return item;
  }

  async create(projectId: string, userId: string, dto: CreateProjectCommentDto): Promise<ProjectComment> {
    const item = await this.repository.create({ projectId, userId, content: dto.content });
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

  async update(id: string, userId: string, dto: UpdateProjectCommentDto): Promise<ProjectComment> {
    const comment = await this.findById(id);
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    const item = await this.repository.update(id, { content: dto.content });
    if (!item) throw new NotFoundException(`Comment #${id} not found`);
    return item;
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.findById(id);
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    await this.repository.remove(id);
  }
}

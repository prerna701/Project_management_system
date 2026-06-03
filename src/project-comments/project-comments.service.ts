import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectCommentsRepository } from './infrastructure/persistence/project-comments.repository';
import { ProjectComment } from './domain/project-comment';
import { CreateProjectCommentDto } from './dto/create-project-comment.dto';
import { UpdateProjectCommentDto } from './dto/update-project-comment.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';

@Injectable()
export class ProjectCommentsService {
  constructor(private readonly repository: ProjectCommentsRepository) {}

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
    return this.repository.create({ projectId, userId, content: dto.content });
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

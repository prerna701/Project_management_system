import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskCommentsRepository } from './infrastructure/persistence/task-comments.repository';
import { TaskComment } from './domain/task-comment';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';

@Injectable()
export class TaskCommentsService {
  constructor(private readonly repository: TaskCommentsRepository) {}

  async findByTask(
    taskId: string,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: TaskComment[]; meta: PaginationMetaDto }> {
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
    return this.repository.create({ taskId, userId, content: dto.content });
  }

  async update(id: string, userId: string, dto: UpdateTaskCommentDto): Promise<TaskComment> {
    const comment = await this.findById(id);
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    const item = await this.repository.update(id, { content: dto.content });
    if (!item) throw new NotFoundException(`Task comment #${id} not found`);
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

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

@Injectable()
export class TaskCommentsService {
  constructor(
    private readonly repository: TaskCommentsRepository,
    private readonly tasksService: TasksService,
    private readonly activitiesService: ProjectActivitiesService,
  ) {}

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
    const task = await this.tasksService.findById(taskId);
    const item = await this.repository.create({ taskId, userId, content: dto.content });
    const isSubtask = Boolean(task.parentTaskId);
    await this.activitiesService.log({
      projectId: task.projectId,
      milestoneId: task.milestoneId,
      taskId: isSubtask ? task.parentTaskId : task.id,
      subtaskId: isSubtask ? task.id : null,
      actorId: userId,
      action: ActivityAction.COMMENT_ADDED,
      entityType: ActivityEntityType.COMMENT,
      entityId: item.id,
      title: isSubtask ? 'Subtask comment added' : 'Task comment added',
      description: `A comment was added to ${isSubtask ? 'subtask' : 'task'} "${task.title}"`,
      metadata: { commentId: item.id },
    });
    return item;
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

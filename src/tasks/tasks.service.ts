import { Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepository } from './infrastructure/persistence/tasks.repository';
import { Task } from './domain/task';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { TaskPriority } from './enums/task-priority.enum';
import { TaskStatus } from './enums/task-status.enum';

@Injectable()
export class TasksService {
  constructor(private readonly repository: TasksRepository) {}

  async findAll(
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    return this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
      search,
      parentTaskId: null,
    });
  }

  async findByProject(
    projectId: string,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    return this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 100 },
      search,
      projectId,
      parentTaskId: null,
    });
  }

  async createForProject(projectId: string, dto: CreateTaskDto): Promise<Task> {
    return this.repository.create({
      projectId,
      title: dto.title,
      description: dto.description ?? null,
      assigneeId: dto.assigneeId ?? null,
      reporterId: dto.reporterId ?? null,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      status: dto.status ?? TaskStatus.OPEN,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      estimatedHours: dto.estimatedHours ?? null,
      loggedHours: 0,
      isBillable: dto.isBillable ?? false,
      dependencies: [],
      attachments: [],
      labels: dto.labels ?? [],
      checklist: [],
    });
  }

  async findByMilestone(
    milestoneId: string,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    return this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
      search,
      milestoneId,
      parentTaskId: null,
    });
  }

  async findSubtasks(
    parentTaskId: string,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    return this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 50 },
      parentTaskId,
    });
  }

  async findById(id: string): Promise<Task> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Task #${id} not found`);
    return item;
  }

  async createForMilestone(milestoneId: string, dto: CreateTaskDto & { projectId: string }): Promise<Task> {
    return this.repository.create({
      projectId: dto.projectId,
      milestoneId,
      title: dto.title,
      description: dto.description ?? null,
      assigneeId: dto.assigneeId ?? null,
      reporterId: dto.reporterId ?? null,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      status: dto.status ?? TaskStatus.OPEN,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      estimatedHours: dto.estimatedHours ?? null,
      loggedHours: 0,
      isBillable: dto.isBillable ?? false,
      dependencies: dto.dependencies ?? [],
      attachments: dto.attachments ?? [],
      labels: dto.labels ?? [],
      checklist: [],
    });
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const payload: Partial<Task> = {
      ...dto,
      startDate: dto.startDate !== undefined ? (dto.startDate ? new Date(dto.startDate) : null) : undefined,
      dueDate: dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : undefined,
    };
    const item = await this.repository.update(id, payload);
    if (!item) throw new NotFoundException(`Task #${id} not found`);
    return item;
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id);
  }

  async assignTask(id: string, dto: AssignTaskDto): Promise<Task> {
    const item = await this.repository.update(id, { assigneeId: dto.assigneeId });
    if (!item) throw new NotFoundException(`Task #${id} not found`);
    return item;
  }

  async createSubtask(parentTaskId: string, dto: CreateSubtaskDto): Promise<Task> {
    const parent = await this.findById(parentTaskId);
    return this.repository.create({
      projectId: parent.projectId,
      milestoneId: parent.milestoneId,
      parentTaskId,
      title: dto.title,
      description: null,
      assigneeId: dto.assigneeId ?? null,
      reporterId: null,
      priority: TaskPriority.MEDIUM,
      status: dto.status ?? TaskStatus.OPEN,
      startDate: null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      estimatedHours: null,
      loggedHours: 0,
      isBillable: parent.isBillable,
      dependencies: [],
      attachments: [],
      labels: [],
      checklist: dto.checklist ?? [],
    });
  }

  async reassignOpenTasks(fromUserId: string, toUserId: string): Promise<void> {
    await this.repository.reassignOpenTasks(fromUserId, toUserId);
  }

  async getTaskCounts(projectId: string): Promise<{ total: number; completed: number }> {
    return this.repository.countByProjectId(projectId);
  }

  async getCompletionPercentage(projectId: string): Promise<number> {
    const { total, completed } = await this.repository.countByProjectId(projectId);
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }
}

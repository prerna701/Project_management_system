import { Task } from '../../domain/task';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';
import { TaskStatus } from '../../enums/task-status.enum';

export interface TaskStatusHistoryEntry {
  id: string;
  taskId: string;
  fromStatus: TaskStatus;
  toStatus: TaskStatus;
  changedBy: string;
  note: string | null;
  createdAt: Date;
}

export abstract class TasksRepository {
  abstract findById(id: string): Promise<Task | null>;
  abstract findManyWithPagination(options: {
    paginationOptions: IPaginationOptions;
    search?: string;
    projectId?: string;
    milestoneId?: string;
    assigneeId?: string;
    parentTaskId?: string | null;
  }): Promise<{ items: Task[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<Task>): Promise<Task>;
  abstract update(id: string, item: Partial<Task>): Promise<Task | null>;
  abstract remove(id: string): Promise<void>;
  abstract reassignOpenTasks(fromUserId: string, toUserId: string): Promise<void>;
  abstract countByProjectId(projectId: string): Promise<{ total: number; completed: number }>;
  abstract countByMilestoneId(
    milestoneId: string,
  ): Promise<{ total: number; completed: number; byStatus: Record<string, number> }>;
  abstract recordStatusChange(
    entry: Omit<TaskStatusHistoryEntry, 'id' | 'createdAt'>,
  ): Promise<TaskStatusHistoryEntry>;
  abstract findStatusHistory(taskId: string): Promise<TaskStatusHistoryEntry[]>;
}

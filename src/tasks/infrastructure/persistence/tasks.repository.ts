import { Task } from '../../domain/task';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class TasksRepository {
  abstract findById(id: string): Promise<Task | null>;
  abstract findManyWithPagination(options: {
    paginationOptions: IPaginationOptions;
    search?: string;
    milestoneId?: string;
    assigneeId?: string;
    parentTaskId?: string | null;
  }): Promise<{ items: Task[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<Task>): Promise<Task>;
  abstract update(id: string, item: Partial<Task>): Promise<Task | null>;
  abstract remove(id: string): Promise<void>;
  abstract reassignOpenTasks(fromUserId: string, toUserId: string): Promise<void>;
  abstract countByProjectId(projectId: string): Promise<{ total: number; completed: number }>;
}

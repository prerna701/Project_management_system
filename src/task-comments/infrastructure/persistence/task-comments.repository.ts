import { TaskComment } from '../../domain/task-comment';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class TaskCommentsRepository {
  abstract findById(id: string): Promise<TaskComment | null>;
  abstract findByTaskId(
    taskId: string,
    options: { paginationOptions: IPaginationOptions },
  ): Promise<{ items: TaskComment[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<TaskComment>): Promise<TaskComment>;
  abstract update(id: string, item: Partial<TaskComment>): Promise<TaskComment | null>;
  abstract remove(id: string): Promise<void>;
}

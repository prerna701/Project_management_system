import { Subtask } from '../../domain/subtask';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class SubtasksRepository {
  abstract findById(id: string): Promise<Subtask | null>;
  abstract findByTaskId(
    taskId: string,
    options: { paginationOptions: IPaginationOptions; search?: string },
  ): Promise<{ items: Subtask[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<Subtask>): Promise<Subtask>;
  abstract update(id: string, item: Partial<Subtask>): Promise<Subtask | null>;
  abstract remove(id: string): Promise<void>;
  abstract countByTaskId(taskId: string): Promise<{ total: number; completed: number }>;
}

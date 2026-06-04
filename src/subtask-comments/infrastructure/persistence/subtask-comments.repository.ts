import { SubtaskComment } from '../../domain/subtask-comment';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class SubtaskCommentsRepository {
  abstract findById(id: string): Promise<SubtaskComment | null>;
  abstract findBySubtaskId(
    subtaskId: string,
    options: { paginationOptions: IPaginationOptions },
  ): Promise<{ items: SubtaskComment[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<SubtaskComment>): Promise<SubtaskComment>;
  abstract update(id: string, item: Partial<SubtaskComment>): Promise<SubtaskComment | null>;
  abstract remove(id: string): Promise<void>;
}

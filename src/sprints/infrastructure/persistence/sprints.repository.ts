import { Sprint } from '../../domain/sprint';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class SprintsRepository {
  abstract findById(id: string): Promise<Sprint | null>;
  abstract findByProjectId(
    projectId: string,
    options: { paginationOptions: IPaginationOptions; search?: string },
  ): Promise<{ items: Sprint[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<Sprint>): Promise<Sprint>;
  abstract update(id: string, item: Partial<Sprint>): Promise<Sprint | null>;
  abstract remove(id: string): Promise<void>;
}

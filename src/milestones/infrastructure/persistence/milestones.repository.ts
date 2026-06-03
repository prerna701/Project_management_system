import { Milestone } from '../../domain/milestone';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class MilestonesRepository {
  abstract findById(id: string): Promise<Milestone | null>;
  abstract findByProjectId(
    projectId: string,
    options: { paginationOptions: IPaginationOptions; search?: string },
  ): Promise<{ items: Milestone[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<Milestone>): Promise<Milestone>;
  abstract update(id: string, item: Partial<Milestone>): Promise<Milestone | null>;
  abstract remove(id: string): Promise<void>;
}

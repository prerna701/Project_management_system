import { Issue } from '../../domain/issue';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class IssuesRepository {
  abstract findById(id: string): Promise<Issue | null>;
  abstract findByProject(
    projectId: string,
    options: { paginationOptions: IPaginationOptions; search?: string },
  ): Promise<{ items: Issue[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<Issue>): Promise<Issue>;
  abstract update(id: string, item: Partial<Issue>): Promise<Issue | null>;
}

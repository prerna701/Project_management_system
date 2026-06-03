import { ProjectComment } from '../../domain/project-comment';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class ProjectCommentsRepository {
  abstract findById(id: string): Promise<ProjectComment | null>;
  abstract findByProjectId(
    projectId: string,
    options: { paginationOptions: IPaginationOptions },
  ): Promise<{ items: ProjectComment[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<ProjectComment>): Promise<ProjectComment>;
  abstract update(id: string, item: Partial<ProjectComment>): Promise<ProjectComment | null>;
  abstract remove(id: string): Promise<void>;
}

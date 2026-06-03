import { ProjectActivity } from '../../domain/project-activity';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class ProjectActivitiesRepository {
  abstract log(item: Omit<ProjectActivity, 'id' | 'createdAt'>): Promise<ProjectActivity>;
  abstract findByProjectId(
    projectId: string,
    options: { paginationOptions: IPaginationOptions },
  ): Promise<{ items: ProjectActivity[]; meta: PaginationMetaDto }>;
}

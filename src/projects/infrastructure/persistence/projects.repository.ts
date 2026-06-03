import { Project } from '../../domain/project';
import { ProjectStatusHistory } from '../../domain/project-status-history';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class ProjectsRepository {
  abstract findById(id: string): Promise<Project | null>;
  abstract findVisibleById(
    id: string,
    options: { userId: string; isAdmin: boolean },
  ): Promise<Project | null>;
  abstract findManyWithPagination(options: {
    paginationOptions: IPaginationOptions;
    search?: string;
    userId?: string;
    isAdmin?: boolean;
  }): Promise<{ items: Project[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<Project>): Promise<Project>;
  abstract update(id: string, item: Partial<Project>): Promise<Project | null>;
  abstract remove(id: string): Promise<void>;
  abstract recordStatusChange(entry: Omit<ProjectStatusHistory, 'id' | 'createdAt'>): Promise<ProjectStatusHistory>;
  abstract findStatusHistory(projectId: string): Promise<ProjectStatusHistory[]>;
  abstract findProjectsByUserId(userId: string): Promise<Project[]>;
  abstract findProjectUsers(projectId: string): Promise<{ userId: string; role: string }[]>;
  abstract addClient(projectId: string, userId: string, addedBy: string, role?: string): Promise<void>;
  abstract removeClient(projectId: string, userId: string): Promise<void>;
  abstract findClients(projectId: string): Promise<{ id: string; userId: string; role: string; addedBy: string; createdAt: Date }[]>;
}

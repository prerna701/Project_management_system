import { ProjectTag } from '../../domain/project-tag';

export abstract class ProjectTagRepository {
  abstract findAll(): Promise<ProjectTag[]>;
  abstract findById(id: string): Promise<ProjectTag | null>;
  abstract create(item: Partial<ProjectTag>): Promise<ProjectTag>;
  abstract update(id: string, item: Partial<ProjectTag>): Promise<ProjectTag | null>;
  abstract remove(id: string): Promise<void>;
}

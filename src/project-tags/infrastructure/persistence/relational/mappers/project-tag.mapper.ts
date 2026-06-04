import { ProjectTag } from '../../../../domain/project-tag';
import { ProjectTagEntity } from '../entities/project-tag.entity';

export class ProjectTagMapper {
  static toDomain(raw: ProjectTagEntity): ProjectTag {
    const item = new ProjectTag();
    item.id = raw.id;
    item.label = raw.label;
    item.color = raw.color;
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<ProjectTag>): Partial<ProjectTagEntity> {
    const entity: Partial<ProjectTagEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.label !== undefined) entity.label = item.label;
    if (item.color !== undefined) entity.color = item.color;
    return entity;
  }
}

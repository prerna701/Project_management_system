import { Sprint } from '../../../../domain/sprint';
import { SprintEntity } from '../entities/sprint.entity';

export class SprintMapper {
  static toDomain(raw: SprintEntity): Sprint {
    const item = new Sprint();
    item.id = raw.id;
    item.projectId = raw.projectId;
    item.name = raw.name;
    item.goal = raw.goal;
    item.status = raw.status;
    item.startDate = raw.startDate;
    item.endDate = raw.endDate;
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<Sprint>): Partial<SprintEntity> {
    const entity: Partial<SprintEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.projectId !== undefined) entity.projectId = item.projectId;
    if (item.name !== undefined) entity.name = item.name;
    if (item.goal !== undefined) entity.goal = item.goal ?? null;
    if (item.status !== undefined) entity.status = item.status;
    if (item.startDate !== undefined) entity.startDate = item.startDate ?? null;
    if (item.endDate !== undefined) entity.endDate = item.endDate ?? null;
    return entity;
  }
}

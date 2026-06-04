import { Milestone } from '../../../../domain/milestone';
import { MilestoneEntity } from '../entities/milestone.entity';

export class MilestoneMapper {
  static toDomain(raw: MilestoneEntity): Milestone {
    const item = new Milestone();
    item.id = raw.id;
    item.projectId = raw.projectId;
    item.name = raw.name;
    item.description = raw.description;
    item.startDate = raw.startDate;
    item.dueDate = raw.dueDate;
    item.ownerId = raw.ownerId;
    item.status = raw.status;
    item.completionPercentage = raw.completionPercentage;
    item.issues = raw.issues ?? [];
    item.comments = raw.comments ?? [];
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<Milestone>): Partial<MilestoneEntity> {
    const entity: Partial<MilestoneEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.projectId !== undefined) entity.projectId = item.projectId;
    if (item.name !== undefined) entity.name = item.name;
    if (item.description !== undefined) entity.description = item.description ?? null;
    if (item.startDate !== undefined) entity.startDate = item.startDate ?? null;
    if (item.dueDate !== undefined) entity.dueDate = item.dueDate ?? null;
    if (item.ownerId !== undefined) entity.ownerId = item.ownerId ?? null;
    if (item.status !== undefined) entity.status = item.status;
    if (item.completionPercentage !== undefined) entity.completionPercentage = item.completionPercentage;
    if (item.issues !== undefined) entity.issues = item.issues ?? [];
    if (item.comments !== undefined) entity.comments = item.comments ?? [];
    return entity;
  }
}

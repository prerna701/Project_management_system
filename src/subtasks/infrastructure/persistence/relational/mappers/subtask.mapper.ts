import { Subtask } from '../../../../domain/subtask';
import { SubtaskEntity } from '../entities/subtask.entity';

export class SubtaskMapper {
  static toDomain(raw: SubtaskEntity): Subtask {
    const item = new Subtask();
    item.id = raw.id;
    item.projectId = raw.projectId;
    item.taskId = raw.taskId;
    item.title = raw.title;
    item.description = raw.description;
    item.notes = raw.notes;
    item.assigneeId = raw.assigneeId;
    item.ownerId = raw.ownerId;
    item.createdBy = raw.createdBy;
    item.priority = raw.priority;
    item.status = raw.status;
    item.startDate = raw.startDate;
    item.dueDate = raw.dueDate;
    item.workHours = raw.workHours;
    item.loggedHours = raw.loggedHours;
    item.completionPercentage = raw.completionPercentage;
    item.isBillable = raw.isBillable;
    item.billingType = raw.billingType;
    item.dependencies = raw.dependencies ?? [];
    item.attachments = raw.attachments ?? [];
    item.labels = raw.labels ?? [];
    item.checklist = raw.checklist ?? [];
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<Subtask>): Partial<SubtaskEntity> {
    const entity: Partial<SubtaskEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.projectId !== undefined) entity.projectId = item.projectId;
    if (item.taskId !== undefined) entity.taskId = item.taskId;
    if (item.title !== undefined) entity.title = item.title;
    if (item.description !== undefined) entity.description = item.description ?? null;
    if (item.notes !== undefined) entity.notes = item.notes ?? null;
    if (item.assigneeId !== undefined) entity.assigneeId = item.assigneeId ?? null;
    if (item.ownerId !== undefined) entity.ownerId = item.ownerId ?? null;
    if (item.createdBy !== undefined) entity.createdBy = item.createdBy ?? null;
    if (item.priority !== undefined) entity.priority = item.priority;
    if (item.status !== undefined) entity.status = item.status;
    if (item.startDate !== undefined) entity.startDate = item.startDate ?? null;
    if (item.dueDate !== undefined) entity.dueDate = item.dueDate ?? null;
    if (item.workHours !== undefined) entity.workHours = item.workHours ?? null;
    if (item.loggedHours !== undefined) entity.loggedHours = item.loggedHours;
    if (item.completionPercentage !== undefined) entity.completionPercentage = item.completionPercentage;
    if (item.isBillable !== undefined) entity.isBillable = item.isBillable;
    if (item.billingType !== undefined) entity.billingType = item.billingType;
    if (item.dependencies !== undefined) entity.dependencies = item.dependencies ?? [];
    if (item.attachments !== undefined) entity.attachments = item.attachments ?? [];
    if (item.labels !== undefined) entity.labels = item.labels ?? [];
    if (item.checklist !== undefined) entity.checklist = item.checklist ?? [];
    return entity;
  }
}

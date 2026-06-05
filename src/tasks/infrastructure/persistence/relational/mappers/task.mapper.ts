import { Task } from '../../../../domain/task';
import { TaskEntity } from '../entities/task.entity';

export class TaskMapper {
  static toDomain(raw: TaskEntity): Task {
    const item = new Task();
    item.id = raw.id;
    item.projectId = raw.projectId;
    item.milestoneId = raw.milestoneId;
    item.teamId = raw.teamId;
    item.title = raw.title;
    item.description = raw.description;
    item.assigneeId = raw.assigneeId;
    item.reporterId = raw.reporterId;
    item.ownerId = raw.ownerId;
    item.createdBy = raw.createdBy;
    item.priority = raw.priority;
    item.status = raw.status;
    item.startDate = raw.startDate;
    item.dueDate = raw.dueDate;
    item.actualEndDate = raw.actualEndDate;
    item.estimatedHours = raw.estimatedHours;
    item.workHours = raw.workHours;
    item.loggedHours = raw.loggedHours;
    item.timeLogTotal = raw.timeLogTotal;
    item.completionPercentage = raw.completionPercentage;
    item.isBillable = raw.isBillable;
    item.billingType = raw.billingType;
    item.dependencies = raw.dependencies ?? [];
    item.attachments = raw.attachments ?? [];
    item.labels = raw.labels ?? [];
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<Task>): Partial<TaskEntity> {
    const entity: Partial<TaskEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.projectId !== undefined) entity.projectId = item.projectId;
    if (item.milestoneId !== undefined) entity.milestoneId = item.milestoneId ?? null;
    if (item.teamId !== undefined) entity.teamId = item.teamId ?? null;
    if (item.title !== undefined) entity.title = item.title;
    if (item.description !== undefined) entity.description = item.description ?? null;
    if (item.assigneeId !== undefined) entity.assigneeId = item.assigneeId ?? null;
    if (item.reporterId !== undefined) entity.reporterId = item.reporterId ?? null;
    if (item.ownerId !== undefined) entity.ownerId = item.ownerId ?? null;
    if (item.createdBy !== undefined) entity.createdBy = item.createdBy ?? null;
    if (item.priority !== undefined) entity.priority = item.priority;
    if (item.status !== undefined) entity.status = item.status;
    if (item.startDate !== undefined) entity.startDate = item.startDate ?? null;
    if (item.dueDate !== undefined) entity.dueDate = item.dueDate ?? null;
    if (item.actualEndDate !== undefined) entity.actualEndDate = item.actualEndDate ?? null;
    if (item.estimatedHours !== undefined) entity.estimatedHours = item.estimatedHours ?? null;
    if (item.workHours !== undefined) entity.workHours = item.workHours ?? null;
    if (item.loggedHours !== undefined) entity.loggedHours = item.loggedHours;
    if (item.timeLogTotal !== undefined) entity.timeLogTotal = item.timeLogTotal;
    if (item.completionPercentage !== undefined) entity.completionPercentage = item.completionPercentage;
    if (item.isBillable !== undefined) entity.isBillable = item.isBillable;
    if (item.billingType !== undefined) entity.billingType = item.billingType;
    if (item.dependencies !== undefined) entity.dependencies = item.dependencies ?? [];
    if (item.attachments !== undefined) entity.attachments = item.attachments ?? [];
    if (item.labels !== undefined) entity.labels = item.labels ?? [];
    return entity;
  }
}

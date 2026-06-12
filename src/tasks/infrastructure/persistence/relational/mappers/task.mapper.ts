import { Task } from '../../../../domain/task';
import { TaskEntity } from '../entities/task.entity';

export class TaskMapper {
  static toDomain(raw: TaskEntity): Task {
    const item = new Task();
    item.id = raw.id;
    item.projectId = raw.projectId;
    item.milestoneId = raw.milestoneId;
    item.parentTaskId = raw.parentTaskId;
    item.sprintId = raw.sprintId;
    item.title = raw.title;
    item.description = raw.description;
    item.assigneeId = raw.assigneeId;
    item.reporterId = raw.reporterId;
    item.priority = raw.priority;
    item.status = raw.status;
    item.startDate = raw.startDate;
    item.dueDate = raw.dueDate;
    item.estimatedHours = raw.estimatedHours;
    item.loggedHours = raw.loggedHours;
    item.isBillable = raw.isBillable;
    item.dependencies = raw.dependencies ?? [];
    item.attachments = raw.attachments ?? [];
    item.labels = raw.labels ?? [];
    item.checklist = raw.checklist ?? [];
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
    if (item.parentTaskId !== undefined) entity.parentTaskId = item.parentTaskId ?? null;
    if (item.sprintId !== undefined) entity.sprintId = item.sprintId ?? null;
    if (item.title !== undefined) entity.title = item.title;
    if (item.description !== undefined) entity.description = item.description ?? null;
    if (item.assigneeId !== undefined) entity.assigneeId = item.assigneeId ?? null;
    if (item.reporterId !== undefined) entity.reporterId = item.reporterId ?? null;
    if (item.priority !== undefined) entity.priority = item.priority;
    if (item.status !== undefined) entity.status = item.status;
    if (item.startDate !== undefined) entity.startDate = item.startDate ?? null;
    if (item.dueDate !== undefined) entity.dueDate = item.dueDate ?? null;
    if (item.estimatedHours !== undefined) entity.estimatedHours = item.estimatedHours ?? null;
    if (item.loggedHours !== undefined) entity.loggedHours = item.loggedHours;
    if (item.isBillable !== undefined) entity.isBillable = item.isBillable;
    if (item.dependencies !== undefined) entity.dependencies = item.dependencies ?? [];
    if (item.attachments !== undefined) entity.attachments = item.attachments ?? [];
    if (item.labels !== undefined) entity.labels = item.labels ?? [];
    if (item.checklist !== undefined) entity.checklist = item.checklist ?? [];
    return entity;
  }
}

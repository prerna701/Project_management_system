import { TimeLog } from '../../../../domain/time-log';
import { TimeLogEntity } from '../entities/time-log.entity';

export class TimeLogMapper {
  static toDomain(raw: TimeLogEntity): TimeLog {
    const item = new TimeLog();
    item.id = raw.id;
    item.taskId = raw.taskId;
    item.projectId = raw.projectId;
    item.userId = raw.userId;
    item.startedAt = raw.startedAt;
    item.activeSince = raw.activeSince;
    item.pausedAt = raw.pausedAt;
    item.endedAt = raw.endedAt;
    item.durationMinutes = raw.durationMinutes;
    item.description = raw.description;
    item.workType = raw.workType;
    item.entryType = raw.entryType;
    item.timerState = raw.timerState;
    item.status = raw.status;
    item.isBillable = raw.isBillable;
    item.manualEntryReason = raw.manualEntryReason;
    item.reviewedById = raw.reviewedById;
    item.reviewedAt = raw.reviewedAt;
    item.rejectionReason = raw.rejectionReason;
    item.branchName = raw.branchName;
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<TimeLog>): Partial<TimeLogEntity> {
    const entity: Partial<TimeLogEntity> = {};
    const keys: (keyof TimeLog)[] = [
      'id',
      'taskId',
      'projectId',
      'userId',
      'startedAt',
      'activeSince',
      'pausedAt',
      'endedAt',
      'durationMinutes',
      'description',
      'workType',
      'entryType',
      'timerState',
      'status',
      'isBillable',
      'manualEntryReason',
      'reviewedById',
      'reviewedAt',
      'rejectionReason',
      'branchName',
    ];
    for (const key of keys) {
      if (item[key] !== undefined) {
        (entity as Record<string, unknown>)[key] = item[key];
      }
    }
    return entity;
  }
}

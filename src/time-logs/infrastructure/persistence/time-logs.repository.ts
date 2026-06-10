import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { TimeLog } from '../../domain/time-log';
import { TimeLogStatus } from '../../enums/time-log-status.enum';

export interface TimeLogFilters {
  from?: Date;
  to?: Date;
  projectId?: string;
  taskId?: string;
  userId?: string;
  status?: TimeLogStatus;
  managedByUserId?: string;
  isAdmin?: boolean;
}

export interface TimeLogReportSummary {
  totals: {
    approvedMinutes: number;
    pendingMinutes: number;
    billableMinutes: number;
    entryCount: number;
    overdueTasks: number;
  };
  users: Array<{
    userId: string;
    name: string;
    approvedMinutes: number;
    pendingMinutes: number;
    billableMinutes: number;
  }>;
  projects: Array<{
    projectId: string;
    projectName: string;
    estimatedMinutes: number;
    approvedMinutes: number;
  }>;
  priorities: Array<{ priority: string; count: number }>;
}

export abstract class TimeLogsRepository {
  abstract findById(id: string): Promise<TimeLog | null>;
  abstract findActiveByUser(userId: string): Promise<TimeLog | null>;
  abstract findMany(options: {
    paginationOptions: IPaginationOptions;
    filters: TimeLogFilters;
  }): Promise<{ items: TimeLog[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<TimeLog>): Promise<TimeLog>;
  abstract update(id: string, item: Partial<TimeLog>): Promise<TimeLog | null>;
  abstract sumApprovedMinutesByTask(taskId: string): Promise<number>;
  abstract getReportSummary(
    filters: TimeLogFilters,
  ): Promise<TimeLogReportSummary>;
}

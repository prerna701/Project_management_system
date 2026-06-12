import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimeEntryType } from '../enums/time-entry-type.enum';
import { TimeLogStatus } from '../enums/time-log-status.enum';
import { TimerState } from '../enums/timer-state.enum';
import { WorkType } from '../enums/work-type.enum';

export class TimeLog {
  @ApiProperty()
  id: string;

  @ApiProperty()
  taskId: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  startedAt: Date;

  @ApiPropertyOptional()
  activeSince: Date | null;

  @ApiPropertyOptional()
  pausedAt: Date | null;

  @ApiPropertyOptional()
  endedAt: Date | null;

  @ApiProperty()
  durationMinutes: number;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty({ enum: WorkType })
  workType: WorkType;

  @ApiProperty({ enum: TimeEntryType })
  entryType: TimeEntryType;

  @ApiProperty({ enum: TimerState })
  timerState: TimerState;

  @ApiProperty({ enum: TimeLogStatus })
  status: TimeLogStatus;

  @ApiProperty()
  isBillable: boolean;

  @ApiPropertyOptional()
  manualEntryReason: string | null;

  @ApiPropertyOptional()
  reviewedById: string | null;

  @ApiPropertyOptional()
  reviewedAt: Date | null;

  @ApiPropertyOptional()
  rejectionReason: string | null;

  @ApiPropertyOptional()
  branchName: string | null;

  @ApiPropertyOptional()
  userName?: string;

  @ApiPropertyOptional()
  taskTitle?: string;

  @ApiPropertyOptional()
  projectName?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date | null;
}

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TimeEntryType } from '../../../../enums/time-entry-type.enum';
import { TimeLogStatus } from '../../../../enums/time-log-status.enum';
import { TimerState } from '../../../../enums/timer-state.enum';
import { WorkType } from '../../../../enums/work-type.enum';

@Entity({ name: 'task_time_logs' })
@Index(['taskId'])
@Index(['projectId'])
@Index(['userId'])
@Index(['status'])
@Index('UQ_task_time_logs_active_user', ['userId'], {
  unique: true,
  where: '"endedAt" IS NULL AND "deletedAt" IS NULL',
})
export class TimeLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  taskId: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  activeSince: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  pausedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endedAt: Date | null;

  @Column({ type: 'integer', default: 0 })
  durationMinutes: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', default: WorkType.DEVELOPMENT })
  workType: WorkType;

  @Column({ type: 'varchar' })
  entryType: TimeEntryType;

  @Column({ type: 'varchar', default: TimerState.STOPPED })
  timerState: TimerState;

  @Column({ type: 'varchar', default: TimeLogStatus.DRAFT })
  status: TimeLogStatus;

  @Column({ type: 'boolean', default: false })
  isBillable: boolean;

  @Column({ type: 'text', nullable: true })
  manualEntryReason: string | null;

  @Column({ type: 'uuid', nullable: true })
  reviewedById: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'varchar', nullable: true })
  branchName: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}

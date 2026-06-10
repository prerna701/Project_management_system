import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkActivityEventType } from '../../enums/work-activity-event-type.enum';

@Entity({ name: 'work_activity_events' })
@Index(['timeLogId', 'occurredAt'])
@Index(['taskId', 'occurredAt'])
@Index(['userId', 'occurredAt'])
export class WorkActivityEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  taskId: string | null;

  @Column({ type: 'uuid', nullable: true })
  timeLogId: string | null;

  @Column({ type: 'varchar' })
  type: WorkActivityEventType;

  @Column({ type: 'timestamptz' })
  occurredAt: Date;

  @Column({ type: 'integer', default: 0 })
  durationSeconds: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}

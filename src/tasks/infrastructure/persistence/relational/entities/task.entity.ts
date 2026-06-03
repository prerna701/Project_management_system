import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskPriority } from '../../../../enums/task-priority.enum';
import { TaskStatus } from '../../../../enums/task-status.enum';

@Entity({ name: 'tasks' })
@Index(['projectId'])
@Index(['milestoneId'])
@Index(['assigneeId'])
@Index(['parentTaskId'])
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  milestoneId: string | null;

  @Column({ type: 'uuid', nullable: true })
  parentTaskId: string | null;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true })
  assigneeId: string | null;

  @Column({ type: 'uuid', nullable: true })
  reporterId: string | null;

  @Column({ type: 'varchar', default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ type: 'varchar', default: TaskStatus.OPEN })
  status: TaskStatus;

  @Column({ type: 'timestamptz', nullable: true })
  startDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'float', nullable: true })
  estimatedHours: number | null;

  @Column({ type: 'float', default: 0 })
  loggedHours: number;

  @Column({ type: 'boolean', default: false })
  isBillable: boolean;

  @Column({ type: 'jsonb', default: [] })
  dependencies: string[];

  @Column({ type: 'jsonb', default: [] })
  attachments: string[];

  @Column({ type: 'jsonb', default: [] })
  labels: string[];

  @Column({ type: 'jsonb', default: [] })
  checklist: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}

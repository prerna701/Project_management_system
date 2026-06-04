import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskPriority } from '../../../../../tasks/enums/task-priority.enum';
import { TaskStatus } from '../../../../../tasks/enums/task-status.enum';
import { TaskBillingType } from '../../../../../tasks/enums/task-billing-type.enum';

@Entity({ name: 'subtasks' })
@Index(['taskId'])
@Index(['projectId'])
@Index(['assigneeId'])
export class SubtaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid' })
  taskId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'uuid', nullable: true })
  assigneeId: string | null;

  @Column({ type: 'uuid', nullable: true })
  ownerId: string | null;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ type: 'varchar', default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ type: 'varchar', default: TaskStatus.OPEN })
  status: TaskStatus;

  @Column({ type: 'timestamptz', nullable: true })
  startDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'float', nullable: true })
  workHours: number | null;

  @Column({ type: 'float', default: 0 })
  loggedHours: number;

  @Column({ type: 'float', default: 0 })
  completionPercentage: number;

  @Column({ type: 'boolean', default: false })
  isBillable: boolean;

  @Column({ type: 'varchar', default: TaskBillingType.NON_BILLABLE })
  billingType: TaskBillingType;

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

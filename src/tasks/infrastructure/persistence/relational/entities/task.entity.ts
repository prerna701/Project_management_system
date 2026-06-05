import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskPriority } from '../../../../enums/task-priority.enum';
import { TaskStatus } from '../../../../enums/task-status.enum';
import { TaskBillingType } from '../../../../enums/task-billing-type.enum';
import { MilestoneEntity } from '../../../../../milestones/infrastructure/persistence/relational/entities/milestone.entity';
import { SubtaskEntity } from '../../../../../subtasks/infrastructure/persistence/relational/entities/subtask.entity';

@Entity({ name: 'tasks' })
@Index(['projectId'])
@Index(['milestoneId'])
@Index(['assigneeId'])
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  milestoneId: string | null;

  @ManyToOne(() => MilestoneEntity, (milestone) => milestone.tasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'milestoneId' })
  milestone: MilestoneEntity | null;

  @Column({ type: 'uuid', nullable: true })
  teamId: string | null;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true })
  assigneeId: string | null;

  @Column({ type: 'uuid', nullable: true })
  reporterId: string | null;

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

  @Column({ type: 'timestamptz', nullable: true })
  actualEndDate: Date | null;

  @Column({ type: 'float', nullable: true })
  estimatedHours: number | null;

  @Column({ type: 'float', nullable: true })
  workHours: number | null;

  @Column({ type: 'float', default: 0 })
  loggedHours: number;

  @Column({ type: 'float', default: 0 })
  timeLogTotal: number;

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

  @OneToMany(() => SubtaskEntity, (subtask) => subtask.task)
  subtasks: SubtaskEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}

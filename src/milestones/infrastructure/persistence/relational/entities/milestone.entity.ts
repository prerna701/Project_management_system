import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MilestoneStatus } from '../../../../enums/milestone-status.enum';

@Entity({ name: 'milestones' })
@Index(['projectId'])
export class MilestoneEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  startDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'uuid', nullable: true })
  ownerId: string | null;

  @Column({ type: 'varchar', default: MilestoneStatus.PLANNED })
  status: MilestoneStatus;

  @Column({ type: 'float', default: 0 })
  completionPercentage: number;

  @Column({ type: 'jsonb', default: [] })
  issues: string[];

  @Column({ type: 'jsonb', default: [] })
  comments: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}

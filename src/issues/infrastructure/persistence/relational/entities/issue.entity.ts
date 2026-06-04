import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IssueStatus } from '../../../../enums/issue-status.enum';

@Entity({ name: 'issues' })
@Index(['projectId'])
@Index(['taskId'])
@Index(['milestoneId'])
@Index(['assignedToId'])
export class IssueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  milestoneId: string | null;

  @Column({ type: 'uuid', nullable: true })
  taskId: string | null;

  @Column({ type: 'uuid', nullable: true })
  subtaskId: string | null;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', default: IssueStatus.OPEN })
  status: IssueStatus;

  @Column({ type: 'uuid' })
  raisedBy: string;

  @Column({ type: 'uuid', nullable: true })
  assignedToId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

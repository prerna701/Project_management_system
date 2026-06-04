import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { MilestoneStatus } from '../../../../enums/milestone-status.enum';

@Entity({ name: 'milestone_status_history' })
@Index(['milestoneId'])
export class MilestoneStatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  milestoneId: string;

  @Column({ type: 'varchar' })
  fromStatus: MilestoneStatus;

  @Column({ type: 'varchar' })
  toStatus: MilestoneStatus;

  @Column({ type: 'uuid' })
  changedBy: string;

  @Column({ type: 'varchar', nullable: true })
  note: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

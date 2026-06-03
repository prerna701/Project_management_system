import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectStatus } from '../../../../enums/project-status.enum';

@Entity({ name: 'project_status_history' })
@Index(['projectId'])
export class ProjectStatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'varchar' })
  fromStatus: ProjectStatus;

  @Column({ type: 'varchar' })
  toStatus: ProjectStatus;

  @Column({ type: 'uuid' })
  changedBy: string;

  @Column({ type: 'varchar', nullable: true })
  note: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

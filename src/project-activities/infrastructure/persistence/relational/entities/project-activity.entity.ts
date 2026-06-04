import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'project_activities' })
@Index(['projectId'])
@Index(['milestoneId'])
@Index(['taskId'])
@Index(['subtaskId'])
@Index(['actorId'])
export class ProjectActivityEntity {
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

  @Column({ type: 'uuid' })
  actorId: string;

  @Column({ type: 'varchar' })
  action: string;

  @Column({ type: 'varchar' })
  entityType: string;

  @Column({ type: 'uuid', nullable: true })
  entityId: string | null;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  oldValue: string | null;

  @Column({ type: 'varchar', nullable: true })
  newValue: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}

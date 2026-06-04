import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProjectPriority } from '../../../../enums/project-priority.enum';
import { ProjectStatus } from '../../../../enums/project-status.enum';
import { ProjectVisibility } from '../../../../enums/project-visibility.enum';

@Entity({ name: 'projects' })
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  code: string | null;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true })
  clientName: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  startDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date | null;

  @Column({ type: 'varchar', default: ProjectPriority.FOUNDATION })
  priority: ProjectPriority;

  @Column({ type: 'varchar', default: ProjectVisibility.PRIVATE })
  visibility: ProjectVisibility;

  @Column({ type: 'varchar', default: ProjectStatus.PLANNING })
  status: ProjectStatus;

  @Column({ type: 'boolean', default: false })
  isBillable: boolean;

  @Column({ type: 'float', nullable: true })
  estimatedHours: number | null;

  @Column({ type: 'float', nullable: true })
  budget: number | null;

  @Column({ type: 'uuid', nullable: true })
  assignedTeamId: string | null;

  @Column({ type: 'uuid', nullable: true })
  projectManagerId: string | null;

  @Column({ type: 'jsonb', default: [] })
  tags: { id: string; label: string; color: string }[];

  @Column({ type: 'jsonb', default: [] })
  attachments: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}

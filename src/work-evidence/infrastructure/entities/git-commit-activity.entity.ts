import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'git_commit_activities' })
@Index(['integrationId', 'sha'], { unique: true })
@Index(['projectId', 'committedAt'])
export class GitCommitActivityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  integrationId: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar' })
  sha: string;

  @Column({ type: 'varchar', nullable: true })
  authorEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  authorName: string | null;

  @Column({ type: 'timestamptz' })
  committedAt: Date;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', nullable: true })
  url: string | null;

  @Column({ type: 'integer', default: 0 })
  filesChanged: number;

  @Column({ type: 'integer', default: 0 })
  additions: number;

  @Column({ type: 'integer', default: 0 })
  deletions: number;

  @Column({ type: 'jsonb', nullable: true })
  raw: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

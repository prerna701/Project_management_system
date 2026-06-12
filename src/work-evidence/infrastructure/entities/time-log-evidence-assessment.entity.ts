import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EvidenceConfidence } from '../../enums/evidence-confidence.enum';
import { EvidenceStatus } from '../../enums/evidence-status.enum';

@Entity({ name: 'time_log_evidence_assessments' })
@Index(['timeLogId'], { unique: true })
export class TimeLogEvidenceAssessmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  timeLogId: string;

  @Column({ type: 'varchar', default: 'GITHUB' })
  provider: string;

  @Column({ type: 'varchar' })
  status: EvidenceStatus;

  @Column({ type: 'varchar' })
  confidence: EvidenceConfidence;

  @Column({ type: 'integer' })
  loggedMinutes: number;

  @Column({ type: 'integer', default: 0 })
  gitWindowMinutes: number;

  @Column({ type: 'integer', default: 0 })
  gitEstimatedMinutes: number;

  @Column({ type: 'integer', default: 0 })
  commitCount: number;

  @Column({ type: 'timestamptz', nullable: true })
  firstCommitAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastCommitAt: Date | null;

  @Column({ type: 'integer', default: 0 })
  largestGapMinutes: number;

  @Column({ type: 'integer', default: 0 })
  filesChanged: number;

  @Column({ type: 'integer', default: 0 })
  additions: number;

  @Column({ type: 'integer', default: 0 })
  deletions: number;

  @Column({ type: 'integer', default: 0 })
  overallScore: number;

  @Column({ type: 'integer', default: 0 })
  activeMinutes: number;

  @Column({ type: 'integer', default: 0 })
  idleMinutes: number;

  @Column({ type: 'integer', default: 0 })
  taskActivityCount: number;

  @Column({ type: 'boolean', default: false })
  hasOverlap: boolean;

  @Column({ type: 'varchar', default: 'MANUAL_REVIEW' })
  recommendation: string;

  @Column({ type: 'jsonb', default: [] })
  warnings: string[];

  @Column({ type: 'jsonb', default: [] })
  commits: Array<{
    sha: string;
    message: string;
    committedAt: string;
    url: string | null;
  }>;

  @Column({ type: 'varchar', nullable: true })
  branchName: string | null;

  @Column({ type: 'timestamptz' })
  assessedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

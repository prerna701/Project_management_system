import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EvidenceProvider } from '../../enums/evidence-provider.enum';

@Entity({ name: 'evidence_provider_results' })
@Index(['timeLogId', 'provider'], { unique: true })
export class EvidenceProviderResultEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  timeLogId: string;

  @Column({ type: 'varchar' })
  provider: EvidenceProvider;

  @Column({ type: 'integer' })
  score: number;

  @Column({ type: 'integer' })
  weight: number;

  @Column({ type: 'integer', default: 0 })
  supportedMinutes: number;

  @Column({ type: 'varchar', default: 'READY' })
  status: string;

  @Column({ type: 'jsonb', default: {} })
  details: Record<string, unknown>;

  @Column({ type: 'jsonb', default: [] })
  warnings: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', nullable: true })
  userEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string | null;

  @Column({ type: 'varchar' })
  method: string;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ type: 'jsonb', nullable: true })
  body: any;

  @Column({ type: 'jsonb', nullable: true })
  params: any;

  @Column({ type: 'int', nullable: true })
  statusCode: number;

  @Column({ type: 'varchar', nullable: true })
  duration: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  module: string;

  @Column({ type: 'varchar', nullable: true })
  entityName: string;

  @Column({ type: 'varchar', nullable: true })
  impact: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: any;

  @Column({ type: 'jsonb', nullable: true })
  newValues: any;

  @Column({ type: 'jsonb', nullable: true })
  changedFields: any;

  @Column({ type: 'jsonb', nullable: true })
  responseData: any;

  @Column({ type: 'varchar', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'boolean', default: false })
  isError: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

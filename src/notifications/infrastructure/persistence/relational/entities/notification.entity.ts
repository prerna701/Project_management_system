import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'notifications' })
@Index(['recipientId', 'isRead'])
@Index(['recipientId', 'createdAt'])
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recipient_id' })
  recipientId: string;

  @Column({ name: 'triggered_by_id', type: 'uuid', nullable: true })
  triggeredById: string | null;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'entity_type', type: 'varchar', nullable: true })
  entityType: string | null;

  @Column({ name: 'entity_id', type: 'varchar', nullable: true })
  entityId: string | null;

  @Column({ name: 'redirect_url', type: 'text', nullable: true })
  redirectUrl: string | null;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

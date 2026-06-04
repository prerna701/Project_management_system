import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'subtask_comments' })
@Index(['subtaskId'])
@Index(['userId'])
export class SubtaskCommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  subtaskId: string;

  @Column({ type: 'uuid', nullable: true })
  parentCommentId: string | null;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', default: [] })
  mentions: string[];

  @Column({ type: 'jsonb', default: [] })
  attachments: string[];

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}

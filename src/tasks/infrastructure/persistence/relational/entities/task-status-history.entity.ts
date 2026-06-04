import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from '../../../../enums/task-status.enum';

@Entity({ name: 'task_status_history' })
@Index(['taskId'])
export class TaskStatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  taskId: string;

  @Column({ type: 'varchar' })
  fromStatus: TaskStatus;

  @Column({ type: 'varchar' })
  toStatus: TaskStatus;

  @Column({ type: 'uuid' })
  changedBy: string;

  @Column({ type: 'varchar', nullable: true })
  note: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

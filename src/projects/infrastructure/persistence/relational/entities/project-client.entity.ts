import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'project_clients' })
@Unique(['projectId', 'userId'])
@Index(['projectId'])
@Index(['userId'])
export class ProjectClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', default: 'client' })
  role: string;

  @Column({ type: 'uuid' })
  addedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}

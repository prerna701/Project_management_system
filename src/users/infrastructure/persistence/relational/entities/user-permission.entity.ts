import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { PermissionEntity } from '../../../../../permissions/infrastructure/persistence/relational/entities/permission.entity';

@Entity({ name: 'user_permissions' })
export class UserPermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE' })
  permission: PermissionEntity;

  @Column({ type: 'int' })
  permissionId: number;

  @Column({ type: 'varchar', nullable: true })
  resourceId?: string;

  @Column({ type: 'varchar', nullable: true })
  resourceType?: string;
}

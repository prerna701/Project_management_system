import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { PermissionEntity } from '../../../../../permissions/infrastructure/persistence/relational/entities/permission.entity';

@Entity({ name: 'role_permissions' })
export class RolePermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  role: RoleEntity;

  @Column({ type: 'int' })
  roleId: number;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE' })
  permission: PermissionEntity;

  @Column({ type: 'int' })
  permissionId: number;
}

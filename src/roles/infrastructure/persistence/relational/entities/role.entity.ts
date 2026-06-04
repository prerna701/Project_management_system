import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user-role.entity';
import { RolePermissionEntity } from '../../../../../users/infrastructure/persistence/relational/entities/role-permission.entity';

@Entity({ name: 'roles' })
export class RoleEntity {
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: String, example: 'Admin' })
  @Column({ type: 'varchar' })
  name: string;

  @ApiProperty({ type: String, example: 'admin' })
  @Column({ type: 'varchar', nullable: true })
  slug?: string;

  @OneToMany(() => UserRoleEntity, (ur) => ur.role)
  userRoles: UserRoleEntity[];

  @OneToMany(() => RolePermissionEntity, (rp) => rp.role)
  rolePermissions: RolePermissionEntity[];
}

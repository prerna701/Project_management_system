import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { RoleRepository } from '../role.repository';
import { RelationalRoleRepository } from './repositories/role.repository';
import { RolePermissionEntity } from '../../../../users/infrastructure/persistence/relational/entities/role-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, RolePermissionEntity])],
  providers: [
    { provide: RoleRepository, useClass: RelationalRoleRepository },
  ],
  exports: [RoleRepository],
})
export class RelationalRolePersistenceModule {}

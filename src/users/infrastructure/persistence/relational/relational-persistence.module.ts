import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { UserPermissionEntity } from './entities/user-permission.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { UserRepository } from '../user.repository';
import { RelationalUserRepository } from './repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserRoleEntity,
      UserPermissionEntity,
      RolePermissionEntity,
    ]),
  ],
  providers: [
    { provide: UserRepository, useClass: RelationalUserRepository },
  ],
  exports: [UserRepository],
})
export class RelationalUserPersistenceModule {}

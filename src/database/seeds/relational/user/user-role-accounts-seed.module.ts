import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { UserRoleEntity } from '../../../../users/infrastructure/persistence/relational/entities/user-role.entity';
import { UserRoleAccountsSeedService } from './user-role-accounts-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, UserRoleEntity])],
  providers: [UserRoleAccountsSeedService],
  exports: [UserRoleAccountsSeedService],
})
export class UserRoleAccountsSeedModule {}

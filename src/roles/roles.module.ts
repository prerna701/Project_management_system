import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RelationalRolePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [RelationalRolePersistenceModule, PermissionsModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService, RelationalRolePersistenceModule],
})
export class RolesModule {}

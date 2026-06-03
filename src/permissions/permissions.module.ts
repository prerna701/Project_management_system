import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { RelationalPermissionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalPermissionPersistenceModule],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService, RelationalPermissionPersistenceModule],
})
export class PermissionsModule {}

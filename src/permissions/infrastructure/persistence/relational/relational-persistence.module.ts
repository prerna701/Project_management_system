import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionRepository } from '../permission.repository';
import { RelationalPermissionRepository } from './repositories/permission.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionEntity])],
  providers: [
    { provide: PermissionRepository, useClass: RelationalPermissionRepository },
  ],
  exports: [PermissionRepository],
})
export class RelationalPermissionPersistenceModule {}

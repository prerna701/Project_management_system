import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import appConfig from '../../../config/app.config';
import databaseConfig from '../../config/database.config';
import { TypeOrmConfigService } from '../../typeorm-config.service';
import { RoleSeedModule } from './role/role-seed.module';
import { PermissionSeedModule } from './permission/permission-seed.module';
import { RolePermissionSeedModule } from './role-permission/role-permission-seed.module';
import { UserSeedModule } from './user/user-seed.module';
import { UserRoleAssignmentSeedModule } from './user-role-assignment/user-role-assignment-seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) =>
        new DataSource(options).initialize(),
    }),
    RoleSeedModule,
    PermissionSeedModule,
    RolePermissionSeedModule,
    UserSeedModule,
    UserRoleAssignmentSeedModule,
  ],
})
export class SeedModule {}

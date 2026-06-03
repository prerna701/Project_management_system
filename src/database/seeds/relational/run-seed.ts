import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { RoleSeedService } from './role/role-seed.service';
import { PermissionSeedService } from './permission/permission-seed.service';
import { RolePermissionSeedService } from './role-permission/role-permission-seed.service';
import { UserSeedService } from './user/user-seed.service';
import { UserRoleAssignmentSeedService } from './user-role-assignment/user-role-assignment-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  console.log('🌱 Starting database seeding...\n');

  // Order matters — FKs must exist before dependants
  await app.get(RoleSeedService).run();
  await app.get(PermissionSeedService).run();
  await app.get(RolePermissionSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(UserRoleAssignmentSeedService).run();

  console.log('\n✅ Seeding completed!');
  await app.close();
};

void runSeed();

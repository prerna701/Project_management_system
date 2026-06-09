import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { RoleSeedService } from './role/role-seed.service';
import { PermissionSeedService } from './permission/permission-seed.service';
import { RolePermissionSeedService } from './role-permission/role-permission-seed.service';
import { UserSeedService } from './user/user-seed.service';
import { UserRoleAccountsSeedService } from './user/user-role-accounts-seed.service';
import { UserRoleAssignmentSeedService } from './user-role-assignment/user-role-assignment-seed.service';
import { ProjectSeedService } from './project/project-seed.service';
import { TaskSeedService } from './task/task-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule, { logger: false });

  // Order matters: FKs must exist before dependants.
  await app.get(RoleSeedService).run();
  await app.get(PermissionSeedService).run();
  await app.get(RolePermissionSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(UserRoleAccountsSeedService).run();
  await app.get(UserRoleAssignmentSeedService).run();
  
  // Seed projects
  const projectIds = await app.get(ProjectSeedService).run();
  
  // Seed tasks and subtasks for each project
  await app.get(TaskSeedService).run(projectIds);

  await app.close();
};

void runSeed();

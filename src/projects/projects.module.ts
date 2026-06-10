import { forwardRef, Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { RelationalProjectsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { UsersModule } from '../users/users.module';
import { TasksModule } from '../tasks/tasks.module';
import { MilestonesModule } from '../milestones/milestones.module';
import { RelationalTeamsPersistenceModule } from '../teams/infrastructure/persistence/relational/relational-persistence.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    RelationalProjectsPersistenceModule,
    AuditLogsModule,
    forwardRef(() => UsersModule),
    forwardRef(() => TasksModule),
    MilestonesModule,
    RelationalTeamsPersistenceModule,
    NotificationsModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService, RelationalProjectsPersistenceModule],
})
export class ProjectsModule {}

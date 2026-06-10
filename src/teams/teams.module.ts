import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { RelationalTeamsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RelationalUserPersistenceModule } from '../users/infrastructure/persistence/relational/relational-persistence.module';
import { RelationalProjectsPersistenceModule } from '../projects/infrastructure/persistence/relational/relational-persistence.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    RelationalTeamsPersistenceModule,
    RelationalUserPersistenceModule,
    AuditLogsModule,
    NotificationsModule,
    RelationalProjectsPersistenceModule,
    TasksModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService, RelationalTeamsPersistenceModule],
})
export class TeamsModule {}

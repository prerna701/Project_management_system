import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { RelationalTasksPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { MilestonesModule } from '../milestones/milestones.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RelationalProjectsPersistenceModule } from '../projects/infrastructure/persistence/relational/relational-persistence.module';
import { RelationalUserPersistenceModule } from '../users/infrastructure/persistence/relational/relational-persistence.module';
import { WorkEvidenceModule } from '../work-evidence/work-evidence.module';

@Module({
  imports: [
    RelationalTasksPersistenceModule,
    RelationalProjectsPersistenceModule,
    RelationalUserPersistenceModule,
    AuditLogsModule,
    MilestonesModule,
    NotificationsModule,
    WorkEvidenceModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService, RelationalTasksPersistenceModule],
})
export class TasksModule {}

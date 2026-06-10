import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { WorkEvidenceModule } from '../work-evidence/work-evidence.module';
import { RelationalProjectsPersistenceModule } from '../projects/infrastructure/persistence/relational/relational-persistence.module';
import { TasksModule } from '../tasks/tasks.module';
import { RelationalUserPersistenceModule } from '../users/infrastructure/persistence/relational/relational-persistence.module';
import { RelationalTimeLogsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { TimeLogsController } from './time-logs.controller';
import { TimeLogsService } from './time-logs.service';

@Module({
  imports: [
    RelationalTimeLogsPersistenceModule,
    RelationalProjectsPersistenceModule,
    RelationalUserPersistenceModule,
    NotificationsModule,
    WorkEvidenceModule,
    TasksModule,
  ],
  controllers: [TimeLogsController],
  providers: [TimeLogsService],
  exports: [TimeLogsService],
})
export class TimeLogsModule {}

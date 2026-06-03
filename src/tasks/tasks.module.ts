import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { RelationalTasksPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { MilestonesModule } from '../milestones/milestones.module';

@Module({
  imports: [RelationalTasksPersistenceModule, AuditLogsModule, MilestonesModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService, RelationalTasksPersistenceModule],
})
export class TasksModule {}

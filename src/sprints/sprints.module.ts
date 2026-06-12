import { Module } from '@nestjs/common';
import { SprintsController } from './sprints.controller';
import { SprintsService } from './sprints.service';
import { RelationalSprintsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [RelationalSprintsPersistenceModule, AuditLogsModule],
  controllers: [SprintsController],
  providers: [SprintsService],
  exports: [SprintsService, RelationalSprintsPersistenceModule],
})
export class SprintsModule {}

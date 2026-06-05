import { Module } from '@nestjs/common';
import { MilestonesController } from './milestones.controller';
import { MilestonesService } from './milestones.service';
import { RelationalMilestonesPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { RelationalTasksPersistenceModule } from '../tasks/infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalMilestonesPersistenceModule, RelationalTasksPersistenceModule, AuditLogsModule],
  controllers: [MilestonesController],
  providers: [MilestonesService],
  exports: [MilestonesService, RelationalMilestonesPersistenceModule],
})
export class MilestonesModule {}

import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { RelationalTeamsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [RelationalTeamsPersistenceModule, AuditLogsModule],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService, RelationalTeamsPersistenceModule],
})
export class TeamsModule {}

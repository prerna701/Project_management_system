import { Module } from '@nestjs/common';
import { ProjectCommentsController } from './project-comments.controller';
import { ProjectCommentsService } from './project-comments.service';
import { RelationalProjectCommentsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ProjectActivitiesModule } from '../project-activities/project-activities.module';

@Module({
  imports: [RelationalProjectCommentsPersistenceModule, AuditLogsModule, ProjectActivitiesModule],
  controllers: [ProjectCommentsController],
  providers: [ProjectCommentsService],
  exports: [ProjectCommentsService],
})
export class ProjectCommentsModule {}

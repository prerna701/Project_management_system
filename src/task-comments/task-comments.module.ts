import { Module } from '@nestjs/common';
import { TaskCommentsController } from './task-comments.controller';
import { TaskCommentsService } from './task-comments.service';
import { RelationalTaskCommentsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ProjectActivitiesModule } from '../project-activities/project-activities.module';
import { TasksModule } from '../tasks/tasks.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    RelationalTaskCommentsPersistenceModule,
    AuditLogsModule,
    ProjectActivitiesModule,
    TasksModule,
    CommentsModule,
  ],
  controllers: [TaskCommentsController],
  providers: [TaskCommentsService],
  exports: [TaskCommentsService],
})
export class TaskCommentsModule {}

import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { RelationalCommentsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    RelationalCommentsPersistenceModule,
    AuditLogsModule,
    NotificationsModule,
    TasksModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService, RelationalCommentsPersistenceModule],
})
export class CommentsModule {}

import { Module } from '@nestjs/common';
import { SubtaskCommentsController } from './subtask-comments.controller';
import { SubtaskCommentsService } from './subtask-comments.service';
import { RelationalSubtaskCommentsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ProjectActivitiesModule } from '../project-activities/project-activities.module';
import { SubtasksModule } from '../subtasks/subtasks.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    RelationalSubtaskCommentsPersistenceModule,
    ProjectActivitiesModule,
    SubtasksModule,
    CommentsModule,
  ],
  controllers: [SubtaskCommentsController],
  providers: [SubtaskCommentsService],
  exports: [SubtaskCommentsService],
})
export class SubtaskCommentsModule {}

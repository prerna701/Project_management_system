import { Module } from '@nestjs/common';
import { SubtasksController } from './subtasks.controller';
import { SubtasksService } from './subtasks.service';
import { RelationalSubtasksPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { ProjectActivitiesModule } from '../project-activities/project-activities.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    RelationalSubtasksPersistenceModule,
    ProjectActivitiesModule,
    TasksModule,
  ],
  controllers: [SubtasksController],
  providers: [SubtasksService],
  exports: [SubtasksService],
})
export class SubtasksModule {}

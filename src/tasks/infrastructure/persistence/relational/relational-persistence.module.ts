import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './entities/task.entity';
import { TaskStatusHistoryEntity } from './entities/task-status-history.entity';
import { TasksRepository } from '../tasks.repository';
import { RelationalTasksRepository } from './repositories/tasks.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity, TaskStatusHistoryEntity])],
  providers: [
    { provide: TasksRepository, useClass: RelationalTasksRepository },
  ],
  exports: [TasksRepository],
})
export class RelationalTasksPersistenceModule {}

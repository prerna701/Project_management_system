import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './entities/task.entity';
import { TasksRepository } from '../tasks.repository';
import { RelationalTasksRepository } from './repositories/tasks.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity])],
  providers: [
    { provide: TasksRepository, useClass: RelationalTasksRepository },
  ],
  exports: [TasksRepository],
})
export class RelationalTasksPersistenceModule {}

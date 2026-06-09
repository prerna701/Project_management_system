import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from 'src/tasks/infrastructure/persistence/relational/entities/task.entity';
import { TaskSeedService } from './task-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity])],
  providers: [TaskSeedService],
  exports: [TaskSeedService],
})
export class TaskSeedModule {}

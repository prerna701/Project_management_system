import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubtaskEntity } from './entities/subtask.entity';
import { RelationalSubtasksRepository } from './repositories/subtasks.repository';
import { SubtasksRepository } from '../subtasks.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubtaskEntity])],
  providers: [
    { provide: SubtasksRepository, useClass: RelationalSubtasksRepository },
  ],
  exports: [SubtasksRepository],
})
export class RelationalSubtasksPersistenceModule {}

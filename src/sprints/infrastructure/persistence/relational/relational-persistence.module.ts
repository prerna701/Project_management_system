import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SprintEntity } from './entities/sprint.entity';
import { SprintsRepository } from '../sprints.repository';
import { RelationalSprintsRepository } from './repositories/sprints.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SprintEntity])],
  providers: [
    { provide: SprintsRepository, useClass: RelationalSprintsRepository },
  ],
  exports: [SprintsRepository],
})
export class RelationalSprintsPersistenceModule {}

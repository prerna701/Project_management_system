import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectActivityEntity } from './entities/project-activity.entity';
import { ProjectActivitiesRepository } from '../project-activities.repository';
import { RelationalProjectActivitiesRepository } from './repositories/project-activities.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectActivityEntity])],
  providers: [
    { provide: ProjectActivitiesRepository, useClass: RelationalProjectActivitiesRepository },
  ],
  exports: [ProjectActivitiesRepository],
})
export class RelationalProjectActivitiesPersistenceModule {}

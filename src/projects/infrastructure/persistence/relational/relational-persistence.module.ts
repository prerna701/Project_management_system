import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { ProjectStatusHistoryEntity } from './entities/project-status-history.entity';
import { ProjectClientEntity } from './entities/project-client.entity';
import { ProjectsRepository } from '../projects.repository';
import { RelationalProjectsRepository } from './repositories/projects.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity, ProjectStatusHistoryEntity, ProjectClientEntity])],
  providers: [
    { provide: ProjectsRepository, useClass: RelationalProjectsRepository },
  ],
  exports: [ProjectsRepository],
})
export class RelationalProjectsPersistenceModule {}

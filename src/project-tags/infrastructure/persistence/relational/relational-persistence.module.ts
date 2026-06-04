import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectTagEntity } from './entities/project-tag.entity';
import { ProjectTagRepository } from '../project-tag.repository';
import { RelationalProjectTagRepository } from './repositories/project-tag.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectTagEntity])],
  providers: [
    { provide: ProjectTagRepository, useClass: RelationalProjectTagRepository },
  ],
  exports: [ProjectTagRepository],
})
export class RelationalProjectTagPersistenceModule {}

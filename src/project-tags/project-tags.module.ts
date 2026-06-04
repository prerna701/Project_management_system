import { Module } from '@nestjs/common';
import { ProjectTagsController } from './project-tags.controller';
import { ProjectTagsService } from './project-tags.service';
import { RelationalProjectTagPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalProjectTagPersistenceModule],
  controllers: [ProjectTagsController],
  providers: [ProjectTagsService],
  exports: [ProjectTagsService],
})
export class ProjectTagsModule {}

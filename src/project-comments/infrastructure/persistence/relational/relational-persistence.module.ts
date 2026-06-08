import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectCommentEntity } from './entities/project-comment.entity';
import { ProjectCommentsRepository } from '../project-comments.repository';
import { RelationalProjectCommentsRepository } from './repositories/project-comments.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectCommentEntity])],
  providers: [
    { provide: ProjectCommentsRepository, useClass: RelationalProjectCommentsRepository },
  ],
  exports: [ProjectCommentsRepository],
})
export class RelationalProjectCommentsPersistenceModule {}

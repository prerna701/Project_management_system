import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubtaskCommentEntity } from './entities/subtask-comment.entity';
import { RelationalSubtaskCommentsRepository } from './repositories/subtask-comments.repository';
import { SubtaskCommentsRepository } from '../subtask-comments.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubtaskCommentEntity])],
  providers: [
    { provide: SubtaskCommentsRepository, useClass: RelationalSubtaskCommentsRepository },
  ],
  exports: [SubtaskCommentsRepository],
})
export class RelationalSubtaskCommentsPersistenceModule {}

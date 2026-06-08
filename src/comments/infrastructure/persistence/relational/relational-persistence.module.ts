import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity';
import { CommentsRepository } from '../comments.repository';
import { RelationalCommentsRepository } from './repositories/comments.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity])],
  providers: [
    { provide: CommentsRepository, useClass: RelationalCommentsRepository },
  ],
  exports: [CommentsRepository],
})
export class RelationalCommentsPersistenceModule {}

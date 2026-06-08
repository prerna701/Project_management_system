import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskCommentEntity } from './entities/task-comment.entity';
import { TaskCommentsRepository } from '../task-comments.repository';
import { RelationalTaskCommentsRepository } from './repositories/task-comments.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TaskCommentEntity])],
  providers: [
    { provide: TaskCommentsRepository, useClass: RelationalTaskCommentsRepository },
  ],
  exports: [TaskCommentsRepository],
})
export class RelationalTaskCommentsPersistenceModule {}

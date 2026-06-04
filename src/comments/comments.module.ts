import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { RelationalProjectsPersistenceModule } from '../projects/infrastructure/persistence/relational/relational-persistence.module';
import { RelationalUserPersistenceModule } from '../users/infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    RelationalProjectsPersistenceModule,
    RelationalUserPersistenceModule,
  ],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}

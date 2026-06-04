import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReleaseNoteEntity } from './entities/release-note.entity';
import { ReleaseNotesRepository } from '../release-notes.repository';
import { RelationalReleaseNotesRepository } from './repositories/release-notes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReleaseNoteEntity])],
  providers: [
    { provide: ReleaseNotesRepository, useClass: RelationalReleaseNotesRepository },
  ],
  exports: [ReleaseNotesRepository],
})
export class RelationalReleaseNotesPersistenceModule {}

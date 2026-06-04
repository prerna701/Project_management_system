import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssueEntity } from './entities/issue.entity';
import { IssuesRepository } from '../issues.repository';
import { RelationalIssuesRepository } from './repositories/issues.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IssueEntity])],
  providers: [
    { provide: IssuesRepository, useClass: RelationalIssuesRepository },
  ],
  exports: [IssuesRepository],
})
export class RelationalIssuesPersistenceModule {}

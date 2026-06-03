import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamEntity } from './entities/team.entity';
import { TeamMemberEntity } from './entities/team-member.entity';
import { TeamsRepository } from '../teams.repository';
import { RelationalTeamsRepository } from './repositories/teams.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity, TeamMemberEntity])],
  providers: [
    { provide: TeamsRepository, useClass: RelationalTeamsRepository },
  ],
  exports: [TeamsRepository],
})
export class RelationalTeamsPersistenceModule {}

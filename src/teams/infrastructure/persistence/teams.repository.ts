import { Team } from '../../domain/team';
import { TeamMember } from '../../domain/team-member';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';
import { CreateTeamMemberDto } from '../../dto/create-team.dto';

export interface TeamAccessOptions {
  userId: string;
  isAdmin: boolean;
}

export abstract class TeamsRepository {
  abstract findById(id: string): Promise<Team | null>;
  abstract findVisibleById(
    id: string,
    access: TeamAccessOptions,
  ): Promise<Team | null>;
  abstract findManyWithPagination(options: {
    paginationOptions: IPaginationOptions;
    search?: string;
    access?: TeamAccessOptions;
  }): Promise<{ items: Team[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<Team>): Promise<Team>;
  abstract createWithMembers(
    item: Partial<Team>,
    members: CreateTeamMemberDto[],
    projectId?: string,
  ): Promise<{ team: Team; members: TeamMember[] }>;
  abstract update(id: string, item: Partial<Team>): Promise<Team | null>;
  abstract remove(id: string): Promise<void>;

  abstract findMembersByTeamId(teamId: string): Promise<TeamMember[]>;
  abstract findActiveMember(teamId: string, userId: string): Promise<TeamMember | null>;
  abstract addMember(data: Partial<TeamMember>): Promise<TeamMember>;
  abstract addMembers(
    teamId: string,
    members: CreateTeamMemberDto[],
  ): Promise<TeamMember[]>;
  abstract deactivateMember(teamId: string, userId: string): Promise<void>;
  abstract findOpenTasksByUser(userId: string): Promise<string[]>;
  abstract reassignTasks(fromUserId: string, toUserId: string): Promise<void>;
}

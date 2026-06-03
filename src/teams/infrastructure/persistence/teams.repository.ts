import { Team } from '../../domain/team';
import { TeamMember } from '../../domain/team-member';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class TeamsRepository {
  abstract findById(id: string): Promise<Team | null>;
  abstract findManyWithPagination(options: {
    paginationOptions: IPaginationOptions;
    search?: string;
  }): Promise<{ items: Team[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<Team>): Promise<Team>;
  abstract update(id: string, item: Partial<Team>): Promise<Team | null>;
  abstract remove(id: string): Promise<void>;

  abstract findMembersByTeamId(teamId: string): Promise<TeamMember[]>;
  abstract findActiveMember(teamId: string, userId: string): Promise<TeamMember | null>;
  abstract addMember(data: Partial<TeamMember>): Promise<TeamMember>;
  abstract deactivateMember(teamId: string, userId: string): Promise<void>;
  abstract findOpenTasksByUser(userId: string): Promise<string[]>;
  abstract reassignTasks(fromUserId: string, toUserId: string): Promise<void>;
}

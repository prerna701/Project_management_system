import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TeamsRepository } from './infrastructure/persistence/teams.repository';
import { Team } from './domain/team';
import { TeamMember } from './domain/team-member';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { TransferMemberDto } from './dto/transfer-member.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly repository: TeamsRepository) {}

  async findAll(
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Team[]; meta: PaginationMetaDto }> {
    return this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
      search,
    });
  }

  async findById(id: string): Promise<Team> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Team #${id} not found`);
    return item;
  }

  async create(dto: CreateTeamDto): Promise<Team> {
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateTeamDto): Promise<Team> {
    const item = await this.repository.update(id, dto);
    if (!item) throw new NotFoundException(`Team #${id} not found`);
    return item;
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id);
  }

  async getMembers(teamId: string): Promise<TeamMember[]> {
    await this.findById(teamId);
    return this.repository.findMembersByTeamId(teamId);
  }

  async addMember(teamId: string, dto: AddTeamMemberDto): Promise<TeamMember> {
    await this.findById(teamId);
    const existing = await this.repository.findActiveMember(teamId, dto.userId);
    if (existing) {
      throw new BadRequestException(`User ${dto.userId} is already an active member of this team`);
    }
    return this.repository.addMember({
      teamId,
      userId: dto.userId,
      teamRole: dto.teamRole,
      reportingManagerId: dto.reportingManagerId,
    });
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    await this.findById(teamId);
    const existing = await this.repository.findActiveMember(teamId, userId);
    if (!existing) {
      throw new NotFoundException(`User ${userId} is not an active member of team ${teamId}`);
    }
    await this.repository.deactivateMember(teamId, userId);
  }

  async transferMember(dto: TransferMemberDto): Promise<TeamMember> {
    const [fromTeam, toTeam] = await Promise.all([
      this.repository.findById(dto.fromTeamId),
      this.repository.findById(dto.toTeamId),
    ]);

    if (!fromTeam) throw new NotFoundException(`Source team ${dto.fromTeamId} not found`);
    if (!toTeam) throw new NotFoundException(`Destination team ${dto.toTeamId} not found`);

    const activeMember = await this.repository.findActiveMember(dto.fromTeamId, dto.userId);
    if (!activeMember) {
      throw new NotFoundException(`User ${dto.userId} is not an active member of team ${dto.fromTeamId}`);
    }

    // Deactivate from old team
    await this.repository.deactivateMember(dto.fromTeamId, dto.userId);

    // Reassign open tasks if requested
    if (dto.reassignOpenTasks && dto.newAssigneeId) {
      await this.repository.reassignTasks(dto.userId, dto.newAssigneeId);
    }

    // Add to new team
    return this.repository.addMember({
      teamId: dto.toTeamId,
      userId: dto.userId,
      teamRole: dto.teamRole,
      reportingManagerId: dto.reportingManagerId,
    });
  }
}

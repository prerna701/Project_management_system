import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from '../entities/team.entity';
import { TeamMemberEntity } from '../entities/team-member.entity';
import { TeamsRepository } from '../../teams.repository';
import { Team } from '../../../../domain/team';
import { TeamMember } from '../../../../domain/team-member';
import { TeamMapper } from '../mappers/team.mapper';
import { TeamMemberMapper } from '../mappers/team-member.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class RelationalTeamsRepository implements TeamsRepository {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teamRepo: Repository<TeamEntity>,
    @InjectRepository(TeamMemberEntity)
    private readonly memberRepo: Repository<TeamMemberEntity>,
  ) {}

  async findById(id: string): Promise<Team | null> {
    const entity = await this.teamRepo.findOne({ where: { id } });
    return entity ? TeamMapper.toDomain(entity) : null;
  }

  async findManyWithPagination(options: {
    paginationOptions: IPaginationOptions;
    search?: string;
  }): Promise<{ items: Team[]; meta: PaginationMetaDto }> {
    const { paginationOptions, search } = options;
    const query = this.teamRepo.createQueryBuilder('team').where('team.deletedAt IS NULL');

    if (search) {
      query.andWhere('(team.name ILIKE :search OR team.department ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    const totalItems = await query.getCount();
    const { page, limit } = paginationOptions;

    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('team.createdAt', 'DESC')
      .getMany();

    return {
      items: entities.map(TeamMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async create(item: Partial<Team>): Promise<Team> {
    const entity = this.teamRepo.create(TeamMapper.toPersistence(item) as TeamEntity);
    const saved = await this.teamRepo.save(entity);
    return TeamMapper.toDomain(saved);
  }

  async update(id: string, item: Partial<Team>): Promise<Team | null> {
    await this.teamRepo.update(id, TeamMapper.toPersistence(item) as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.teamRepo.softDelete(id);
  }

  async findMembersByTeamId(teamId: string): Promise<TeamMember[]> {
    const entities = await this.memberRepo.find({
      where: { teamId, isActive: true },
    });
    return entities.map(TeamMemberMapper.toDomain);
  }

  async findActiveMember(teamId: string, userId: string): Promise<TeamMember | null> {
    const entity = await this.memberRepo.findOne({
      where: { teamId, userId, isActive: true },
    });
    return entity ? TeamMemberMapper.toDomain(entity) : null;
  }

  async addMember(data: Partial<TeamMember>): Promise<TeamMember> {
    const entity = this.memberRepo.create({
      teamId: data.teamId,
      userId: data.userId,
      teamRole: data.teamRole ?? null,
      reportingManagerId: data.reportingManagerId ?? null,
      joinedAt: new Date(),
      isActive: true,
    });
    const saved = await this.memberRepo.save(entity);
    return TeamMemberMapper.toDomain(saved);
  }

  async deactivateMember(teamId: string, userId: string): Promise<void> {
    await this.memberRepo.update(
      { teamId, userId, isActive: true },
      { isActive: false, leftAt: new Date() },
    );
  }

  async findOpenTasksByUser(_userId: string): Promise<string[]> {
    // Resolved via TasksRepository when wired together; returns empty here to avoid circular dep
    return [];
  }

  async reassignTasks(_fromUserId: string, _toUserId: string): Promise<void> {
    // Resolved via TasksService when wired together
  }
}

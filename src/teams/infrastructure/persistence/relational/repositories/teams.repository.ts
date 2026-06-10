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
import { TeamAccessOptions } from '../../teams.repository';
import { CreateTeamMemberDto } from '../../../../dto/create-team.dto';
import { ProjectEntity } from '../../../../../projects/infrastructure/persistence/relational/entities/project.entity';

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

  async findVisibleById(
    id: string,
    access: TeamAccessOptions,
  ): Promise<Team | null> {
    const query = this.teamRepo
      .createQueryBuilder('team')
      .where('team.id = :id', { id })
      .andWhere('team.deletedAt IS NULL');
    this.applyAccessFilter(query, access);
    const entity = await query.getOne();
    return entity ? TeamMapper.toDomain(entity) : null;
  }

  async findManyWithPagination(options: {
    paginationOptions: IPaginationOptions;
    search?: string;
    access?: TeamAccessOptions;
  }): Promise<{ items: Team[]; meta: PaginationMetaDto }> {
    const { paginationOptions, search } = options;
    const query = this.teamRepo.createQueryBuilder('team').where('team.deletedAt IS NULL');

    if (options.access) this.applyAccessFilter(query, options.access);

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

  async createWithMembers(
    item: Partial<Team>,
    members: CreateTeamMemberDto[],
    projectId?: string,
  ): Promise<{ team: Team; members: TeamMember[] }> {
    return this.teamRepo.manager.transaction(async (manager) => {
      const teamRepository = manager.getRepository(TeamEntity);
      const memberRepository = manager.getRepository(TeamMemberEntity);
      const teamEntity = await teamRepository.save(
        teamRepository.create(TeamMapper.toPersistence(item) as TeamEntity),
      );

      const uniqueMembers = this.uniqueMembers(members);
      const memberEntities = uniqueMembers.length
        ? await memberRepository.save(
            uniqueMembers.map((member) =>
              memberRepository.create({
                teamId: teamEntity.id,
                userId: member.userId,
                teamRole: member.teamRole ?? null,
                reportingManagerId: member.reportingManagerId ?? null,
                joinedAt: new Date(),
                leftAt: null,
                isActive: true,
              }),
            ),
          )
        : [];

      if (projectId) {
        await manager.getRepository(ProjectEntity).update(projectId, {
          assignedTeamId: teamEntity.id,
        });
      }

      return {
        team: TeamMapper.toDomain(teamEntity),
        members: memberEntities.map(TeamMemberMapper.toDomain),
      };
    });
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

  async addMembers(
    teamId: string,
    members: CreateTeamMemberDto[],
  ): Promise<TeamMember[]> {
    return this.memberRepo.manager.transaction(async (manager) => {
      const repository = manager.getRepository(TeamMemberEntity);
      const results: TeamMemberEntity[] = [];

      for (const member of this.uniqueMembers(members)) {
        const existing = await repository.findOne({
          where: { teamId, userId: member.userId, isActive: true },
        });
        if (existing) continue;

        results.push(
          await repository.save(
            repository.create({
              teamId,
              userId: member.userId,
              teamRole: member.teamRole ?? null,
              reportingManagerId: member.reportingManagerId ?? null,
              joinedAt: new Date(),
              leftAt: null,
              isActive: true,
            }),
          ),
        );
      }

      return results.map(TeamMemberMapper.toDomain);
    });
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

  private applyAccessFilter(
    query: ReturnType<Repository<TeamEntity>['createQueryBuilder']>,
    access: TeamAccessOptions,
  ): void {
    if (access.isAdmin) return;
    query.andWhere(
      `(
        team.createdBy = :teamUserId
        OR team.teamLeadId = :teamUserId
        OR EXISTS (
          SELECT 1
          FROM team_members member
          WHERE member."teamId" = team.id
            AND member."userId" = :teamUserId
            AND member."isActive" = true
        )
      )`,
      { teamUserId: access.userId },
    );
  }

  private uniqueMembers(members: CreateTeamMemberDto[]): CreateTeamMemberDto[] {
    return [
      ...new Map(members.map((member) => [member.userId, member])).values(),
    ];
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TeamsRepository } from './infrastructure/persistence/teams.repository';
import { Team } from './domain/team';
import { TeamMember } from './domain/team-member';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { TransferMemberDto } from './dto/transfer-member.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UserRepository } from '../users/infrastructure/persistence/user.repository';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { RoleEnum } from '../roles/roles.enum';
import { AddTeamMembersDto } from './dto/add-team-members.dto';
import { ProjectsRepository } from '../projects/infrastructure/persistence/projects.repository';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class TeamsService {
  constructor(
    private readonly repository: TeamsRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationsService: NotificationsService,
    private readonly projectsRepository: ProjectsRepository,
    private readonly tasksService: TasksService,
  ) {}

  async findAll(
    currentUser: JwtPayloadType,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Team[]; meta: PaginationMetaDto }> {
    return this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
      search,
      access: await this.getAccessOptions(currentUser),
    });
  }

  async findById(id: string, currentUser?: JwtPayloadType): Promise<Team> {
    const item = currentUser
      ? await this.repository.findVisibleById(
          id,
          await this.getAccessOptions(currentUser),
        )
      : await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Team #${id} not found`);
    return item;
  }

  async create(
    dto: CreateTeamDto,
    currentUser: JwtPayloadType,
  ): Promise<Team> {
    const access = await this.getAccessOptions(currentUser);
    let projectName: string | undefined;

    if (dto.projectId) {
      const project = await this.projectsRepository.findVisibleById(
        dto.projectId,
        access,
      );
      if (!project) {
        throw new ForbiddenException(
          'You are not allowed to assign a team to this project',
        );
      }
      projectName = project.name;
    }

    const members = [...(dto.members ?? [])];
    if (
      dto.teamLeadId &&
      !members.some((member) => member.userId === dto.teamLeadId)
    ) {
      members.push({
        userId: dto.teamLeadId,
        teamRole: 'Team Leader',
        reportingManagerId: currentUser.id,
      });
    }

    await this.assertUsersExist(members.map((member) => member.userId));
    const { projectId, members: _members, ...teamData } = dto;
    const result = await this.repository.createWithMembers(
      { ...teamData, createdBy: currentUser.id },
      members,
      projectId,
    );

    await this.notifyMembersAdded(
      result.team,
      result.members,
      currentUser.id,
      projectId,
      projectName,
    );
    if (projectId && projectName) {
      const actor = await this.userRepository.findById(currentUser.id);
      await this.notificationsService.notifyProjectAssigned({
        projectId,
        projectName,
        teamId: result.team.id,
        teamName: result.team.name,
        memberIds: result.members.map((member) => member.userId),
        assignedById: currentUser.id,
        actorName:
          [actor?.firstName, actor?.lastName].filter(Boolean).join(' ') ||
          'a manager',
      });
    }

    return result.team;
  }

  async getAssignableUsers(search?: string) {
    const users = await this.userRepository.findManyWithPagination({
      paginationOptions: { page: 1, limit: 100 },
      search,
    });

    return Promise.all(
      users.items.map(async (user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: (await this.userRepository.getUserRoles(user.id)).map((role) => ({
          id: role.id,
          name: role.name,
          slug: role.slug,
        })),
      })),
    );
  }

  async update(
    id: string,
    dto: UpdateTeamDto,
    currentUser: JwtPayloadType,
  ): Promise<Team> {
    await this.assertAccess(id, currentUser);
    const item = await this.repository.update(id, dto);
    if (!item) throw new NotFoundException(`Team #${id} not found`);
    return item;
  }

  async remove(id: string, currentUser: JwtPayloadType): Promise<void> {
    await this.assertAccess(id, currentUser);
    await this.repository.remove(id);
  }

  async getMembers(
    teamId: string,
    currentUser: JwtPayloadType,
  ): Promise<TeamMember[]> {
    await this.assertAccess(teamId, currentUser);
    return this.repository.findMembersByTeamId(teamId);
  }

  async addMember(
    teamId: string,
    dto: AddTeamMemberDto,
    addedById?: string,
    currentUser?: JwtPayloadType,
  ): Promise<TeamMember> {
    if (currentUser) await this.assertAccess(teamId, currentUser);
    const team = await this.findById(teamId);
    const existing = await this.repository.findActiveMember(teamId, dto.userId);
    if (existing) {
      throw new BadRequestException(`User ${dto.userId} is already an active member of this team`);
    }
    const member = await this.repository.addMember({
      teamId,
      userId: dto.userId,
      teamRole: dto.teamRole,
      reportingManagerId: dto.reportingManagerId,
    });

    if (addedById) {
      this.notificationsService
        .notifyTeamMemberAdded({
          teamId,
          teamName: team.name,
          memberId: dto.userId,
          addedById,
        })
        .catch(() => undefined);
    }

    return member;
  }

  async addMembers(
    teamId: string,
    dto: AddTeamMembersDto,
    currentUser: JwtPayloadType,
  ): Promise<TeamMember[]> {
    await this.assertAccess(teamId, currentUser);
    await this.assertUsersExist(dto.members.map((member) => member.userId));
    const team = await this.findById(teamId);
    const members = await this.repository.addMembers(teamId, dto.members);
    await this.notifyMembersAdded(team, members, currentUser.id);
    return members;
  }

  async removeMember(
    teamId: string,
    userId: string,
    currentUser: JwtPayloadType,
  ): Promise<void> {
    await this.assertAccess(teamId, currentUser);
    const existing = await this.repository.findActiveMember(teamId, userId);
    if (!existing) {
      throw new NotFoundException(`User ${userId} is not an active member of team ${teamId}`);
    }
    const team = await this.findById(teamId);
    await this.repository.deactivateMember(teamId, userId);
    const actor = await this.userRepository.findById(currentUser.id);
    await this.notificationsService.notifyTeamMemberRemoved({
      teamId,
      teamName: team.name,
      memberId: userId,
      removedById: currentUser.id,
      actorName:
        [actor?.firstName, actor?.lastName].filter(Boolean).join(' ') ||
        'a manager',
    });
  }

  async transferMember(
    dto: TransferMemberDto,
    transferredById?: string,
    currentUser?: JwtPayloadType,
  ): Promise<TeamMember> {
    if (currentUser) {
      await Promise.all([
        this.assertAccess(dto.fromTeamId, currentUser),
        this.assertAccess(dto.toTeamId, currentUser),
      ]);
    }
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

    await this.repository.deactivateMember(dto.fromTeamId, dto.userId);

    if (dto.reassignOpenTasks && dto.newAssigneeId) {
      await this.tasksService.reassignOpenTasks(
        dto.userId,
        dto.newAssigneeId,
      );
    }

    const member = await this.repository.addMember({
      teamId: dto.toTeamId,
      userId: dto.userId,
      teamRole: dto.teamRole,
      reportingManagerId: dto.reportingManagerId,
    });

    if (transferredById) {
      const actor = await this.userRepository.findById(transferredById);
      await this.notificationsService.notifyTeamMemberTransferred({
        fromTeamId: fromTeam.id,
        fromTeamName: fromTeam.name,
        toTeamId: toTeam.id,
        toTeamName: toTeam.name,
        memberId: dto.userId,
        transferredById,
        actorName:
          [actor?.firstName, actor?.lastName].filter(Boolean).join(' ') ||
          'a manager',
      });
    }

    return member;
  }

  private async assertAccess(
    teamId: string,
    currentUser: JwtPayloadType,
  ): Promise<void> {
    const team = await this.repository.findVisibleById(
      teamId,
      await this.getAccessOptions(currentUser),
    );
    if (!team) {
      throw new ForbiddenException('You are not allowed to access this team');
    }
  }

  private async getAccessOptions(currentUser: JwtPayloadType) {
    const tokenRole = currentUser.role;
    if (
      String(tokenRole?.id) === RoleEnum.admin.toString() ||
      String(tokenRole?.name ?? '').toLowerCase() === 'admin'
    ) {
      return { userId: currentUser.id, isAdmin: true };
    }

    const roles = await this.userRepository.getUserRoles(currentUser.id);
    return {
      userId: currentUser.id,
      isAdmin: roles.some(
        (role) =>
          String(role?.id) === RoleEnum.admin.toString() ||
          String(role?.name ?? '').toLowerCase() === 'admin',
      ),
    };
  }

  private async assertUsersExist(userIds: string[]): Promise<void> {
    const uniqueIds = [...new Set(userIds)];
    const users = await Promise.all(
      uniqueIds.map((userId) => this.userRepository.findById(userId)),
    );
    const missingIndex = users.findIndex((user) => !user);
    if (missingIndex >= 0) {
      throw new BadRequestException(
        `User ${uniqueIds[missingIndex]} does not exist`,
      );
    }
  }

  private async notifyMembersAdded(
    team: Team,
    members: TeamMember[],
    addedById: string,
    projectId?: string,
    projectName?: string,
  ): Promise<void> {
    const [actor, assignedProject] = await Promise.all([
      this.userRepository.findById(addedById),
      projectId || projectName
        ? Promise.resolve(null)
        : this.projectsRepository.findByAssignedTeamId(team.id),
    ]);
    const resolvedProjectId = projectId ?? assignedProject?.id;
    const resolvedProjectName = projectName ?? assignedProject?.name;
    const actorName =
      [actor?.firstName, actor?.lastName].filter(Boolean).join(' ') ||
      'a manager';

    await Promise.all(
      members.map((member) =>
        this.notificationsService.notifyTeamMemberAdded({
          teamId: team.id,
          teamName: team.name,
          memberId: member.userId,
          addedById,
          projectId: resolvedProjectId,
          projectName: resolvedProjectName,
          actorName,
        }),
      ),
    );
  }
}

import { Team } from '../../../../domain/team';
import { TeamEntity } from '../entities/team.entity';

export class TeamMapper {
  static toDomain(raw: TeamEntity): Team {
    const item = new Team();
    item.id = raw.id;
    item.name = raw.name;
    item.description = raw.description;
    item.teamLeadId = raw.teamLeadId;
    item.department = raw.department;
    item.isActive = raw.isActive;
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<Team>): Partial<TeamEntity> {
    const entity: Partial<TeamEntity> = {};
    if (item.id) entity.id = item.id;
    if (item.name !== undefined) entity.name = item.name;
    if (item.description !== undefined) entity.description = item.description ?? null;
    if (item.teamLeadId !== undefined) entity.teamLeadId = item.teamLeadId ?? null;
    if (item.department !== undefined) entity.department = item.department ?? null;
    if (item.isActive !== undefined) entity.isActive = item.isActive;
    return entity;
  }
}

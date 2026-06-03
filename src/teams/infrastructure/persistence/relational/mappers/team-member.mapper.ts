import { TeamMember } from '../../../../domain/team-member';
import { TeamMemberEntity } from '../entities/team-member.entity';

export class TeamMemberMapper {
  static toDomain(raw: TeamMemberEntity): TeamMember {
    const item = new TeamMember();
    item.id = raw.id;
    item.teamId = raw.teamId;
    item.userId = raw.userId;
    item.teamRole = raw.teamRole;
    item.reportingManagerId = raw.reportingManagerId;
    item.joinedAt = raw.joinedAt;
    item.leftAt = raw.leftAt;
    item.isActive = raw.isActive;
    return item;
  }
}

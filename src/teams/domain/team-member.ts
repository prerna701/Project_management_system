import { ApiProperty } from '@nestjs/swagger';

export class TeamMember {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  teamId: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ type: String, nullable: true })
  teamRole: string | null;

  @ApiProperty({ type: String, nullable: true })
  reportingManagerId: string | null;

  @ApiProperty({ nullable: true })
  joinedAt: Date | null;

  @ApiProperty({ nullable: true })
  leftAt: Date | null;

  @ApiProperty({ type: Boolean })
  isActive: boolean;
}

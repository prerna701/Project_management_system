import { ApiProperty } from '@nestjs/swagger';

export class Team {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ type: String, nullable: true })
  teamLeadId: string | null;

  @ApiProperty({ type: String, nullable: true })
  createdBy: string | null;

  @ApiProperty({ type: String, nullable: true })
  department: string | null;

  @ApiProperty({ type: Boolean })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  deletedAt: Date | null;
}

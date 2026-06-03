import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignTeamDto {
  @ApiProperty({ example: 'team-uuid' })
  @IsNotEmpty()
  @IsUUID()
  assignedTeamId: string;
}

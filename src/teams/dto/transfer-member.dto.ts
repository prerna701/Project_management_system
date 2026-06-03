import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class TransferMemberDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'old-team-uuid' })
  @IsNotEmpty()
  @IsUUID()
  fromTeamId: string;

  @ApiProperty({ example: 'new-team-uuid' })
  @IsNotEmpty()
  @IsUUID()
  toTeamId: string;

  @ApiPropertyOptional({ example: 'Developer' })
  @IsOptional()
  @IsString()
  teamRole?: string;

  @ApiPropertyOptional({ example: 'new-manager-user-uuid' })
  @IsOptional()
  @IsUUID()
  reportingManagerId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  reassignOpenTasks?: boolean;

  @ApiPropertyOptional({ example: 'new-assignee-uuid' })
  @IsOptional()
  @IsUUID()
  newAssigneeId?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddTeamMemberDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: 'Developer' })
  @IsOptional()
  @IsString()
  teamRole?: string;

  @ApiPropertyOptional({ example: 'manager-user-uuid' })
  @IsOptional()
  @IsUUID()
  reportingManagerId?: string;
}

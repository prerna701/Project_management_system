import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateTeamMemberDto {
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

export class CreateTeamDto {
  @ApiProperty({ example: 'Mobile App Team' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Handles mobile development' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsOptional()
  @IsUUID()
  teamLeadId?: string;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: 'project-uuid' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({ type: [CreateTeamMemberDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTeamMemberDto)
  members?: CreateTeamMemberDto[];
}

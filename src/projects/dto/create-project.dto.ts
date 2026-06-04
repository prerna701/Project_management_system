import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectPriority } from '../enums/project-priority.enum';
import { ProjectStatus } from '../enums/project-status.enum';
import { ProjectVisibility } from '../enums/project-visibility.enum';

export class ProjectTagDto {
  @ApiProperty({ example: 'tag-001' })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({ example: 'Frontend' })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({ example: '#60a5fa' })
  @IsNotEmpty()
  @IsString()
  color: string;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'CRM System' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'CRM-001' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Internal CRM system' })
  @IsOptional()
  @IsString()
  description?: string;

 @ApiPropertyOptional({ example: 'ABC Client' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ example: '2026-06-10' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: ProjectPriority,
    description:
      'Optional override. If omitted, backend resolves it from estimatedHours: FOUNDATION ≤100h, ADVANCED 101-400h, STRATEGIC 401+h.',
  })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiPropertyOptional({
    enum: ProjectVisibility,
    default: ProjectVisibility.PRIVATE,
    description:
      'PUBLIC is visible to any authenticated user. PRIVATE is visible to admin, assigned team members, and project manager.',
  })
  @IsOptional()
  @IsEnum(ProjectVisibility)
  visibility?: ProjectVisibility;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.PLANNING })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isBillable?: boolean;

  @ApiPropertyOptional({ example: 1200 })
  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ example: 'team-uuid' })
  @IsOptional()
  @IsUUID()
  assignedTeamId?: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsOptional()
  @IsUUID()
  projectManagerId?: string;

  @ApiPropertyOptional({ type: [ProjectTagDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectTagDto)
  tags?: ProjectTagDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  attachments?: string[];
}

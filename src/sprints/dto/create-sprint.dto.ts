import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SprintStatus } from '../enums/sprint-status.enum';

export class CreateSprintDto {
  @ApiProperty({ example: 'Sprint 1' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Deliver user authentication module' })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiPropertyOptional({ enum: SprintStatus, default: SprintStatus.PLANNED })
  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-06-14' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

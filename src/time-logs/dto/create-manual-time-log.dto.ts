import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { WorkType } from '../enums/work-type.enum';

export class CreateManualTimeLogDto {
  @ApiProperty()
  @IsUUID()
  taskId: string;

  @ApiProperty()
  @IsDateString()
  startedAt: string;

  @ApiProperty()
  @IsDateString()
  endedAt: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: WorkType, default: WorkType.DEVELOPMENT })
  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  manualEntryReason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBillable?: boolean;

  @ApiPropertyOptional({ maxLength: 255, description: 'Git branch the work was done on' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  branchName?: string;
}

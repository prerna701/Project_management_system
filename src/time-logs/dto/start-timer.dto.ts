import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { WorkType } from '../enums/work-type.enum';

export class StartTimerDto {
  @ApiProperty()
  @IsUUID()
  taskId: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ enum: WorkType, default: WorkType.DEVELOPMENT })
  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBillable?: boolean;
}

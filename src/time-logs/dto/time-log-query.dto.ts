import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { BasePaginationQueryDto } from '../../common/dto/base-query.dto';
import { TimeLogStatus } from '../enums/time-log-status.enum';

export class TimeLogQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  taskId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ enum: TimeLogStatus })
  @IsOptional()
  @IsEnum(TimeLogStatus)
  status?: TimeLogStatus;

  @ApiPropertyOptional({ minimum: 1, maximum: 168, default: 40 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(168)
  weeklyCapacityHours?: number = 40;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class BasePaginationQueryDto {
  @ApiPropertyOptional({ description: 'Page number', type: Number, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', type: Number, minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class BaseQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term', type: String })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Tags to filter by', type: [String], isArray: true })
  @IsOptional()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((v) => v.trim()).filter(Boolean)
      : Array.isArray(value)
        ? value.map((v) => String(v).trim()).filter(Boolean)
        : value,
  )
  tags?: string[];

  @ApiPropertyOptional({ description: 'Field to sort by', type: String })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], description: 'Sort direction', default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';
}

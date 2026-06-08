import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { CommentableEntity } from '../enums/commentable-entity.enum';

export class CommentQueryDto {
  @ApiProperty({ enum: CommentableEntity })
  @IsEnum(CommentableEntity)
  entityType: CommentableEntity;

  @ApiProperty({ type: String })
  @IsUUID()
  entityId: string;

  @ApiPropertyOptional({ type: Number, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ type: Number, minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by parent comment ID (null = top-level only)',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

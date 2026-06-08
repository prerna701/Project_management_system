import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { CommentableEntity } from '../enums/commentable-entity.enum';

export class CreateCommentDto {
  @ApiProperty({ enum: CommentableEntity, description: 'The type of entity being commented on' })
  @IsEnum(CommentableEntity)
  entityType: CommentableEntity;

  @ApiProperty({ type: String, description: 'UUID of the entity being commented on' })
  @IsUUID()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({ type: String, description: 'Comment body text', maxLength: 5000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'User IDs mentioned/tagged in the comment',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  mentions?: string[];

  @ApiPropertyOptional({
    type: String,
    description: 'Parent comment ID for threaded replies',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

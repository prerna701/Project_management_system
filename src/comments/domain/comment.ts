import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommentableEntity } from '../enums/commentable-entity.enum';

export class Comment {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ enum: CommentableEntity })
  entityType: CommentableEntity;

  @ApiProperty({ type: String })
  entityId: string;

  @ApiProperty({ type: String })
  authorId: string;

  @ApiProperty({ type: String })
  content: string;

  @ApiProperty({ type: Boolean })
  isEdited: boolean;

  @ApiPropertyOptional({ type: Date })
  editedAt: Date | null;

  @ApiPropertyOptional({ type: [String], description: 'User IDs mentioned in this comment' })
  mentions: string[];

  @ApiPropertyOptional({ type: String, description: 'Parent comment ID for threaded replies' })
  parentId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date | null;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubtaskComment {
  @ApiProperty()
  id: string;

  @ApiProperty()
  subtaskId: string;

  @ApiPropertyOptional()
  parentCommentId: string | null;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional({ type: [String] })
  mentions: string[];

  @ApiPropertyOptional({ type: [String] })
  attachments: string[];

  @ApiProperty()
  isEdited: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date | null;
}

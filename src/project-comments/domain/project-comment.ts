import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectComment {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty()
  projectId: string;

  @ApiPropertyOptional()
  milestoneId: string | null;

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

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectComment {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date | null;
}

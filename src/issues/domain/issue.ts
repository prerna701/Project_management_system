import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IssueStatus } from '../enums/issue-status.enum';

export class Issue {
  @ApiProperty()
  id: string;

  @ApiProperty()
  projectId: string;

  @ApiPropertyOptional()
  milestoneId: string | null;

  @ApiPropertyOptional()
  taskId: string | null;

  @ApiPropertyOptional()
  subtaskId: string | null;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty({ enum: IssueStatus })
  status: IssueStatus;

  @ApiProperty()
  raisedBy: string;

  @ApiPropertyOptional()
  assignedToId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

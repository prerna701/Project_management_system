import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MilestoneStatus } from '../enums/milestone-status.enum';

export class Milestone {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiPropertyOptional()
  startDate: Date | null;

  @ApiPropertyOptional()
  dueDate: Date | null;

  @ApiPropertyOptional()
  ownerId: string | null;

  @ApiProperty({ enum: MilestoneStatus })
  status: MilestoneStatus;

  @ApiProperty()
  completionPercentage: number;

  @ApiPropertyOptional({ type: [String] })
  issues: string[];

  @ApiPropertyOptional({ type: [String] })
  comments: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date | null;
}

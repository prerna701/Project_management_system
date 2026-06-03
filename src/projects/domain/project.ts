import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectPriority } from '../enums/project-priority.enum';
import { ProjectStatus } from '../enums/project-status.enum';
import { ProjectVisibility } from '../enums/project-visibility.enum';

export class Project {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  code: string | null;

  @ApiPropertyOptional()
  description: string | null;

  @ApiPropertyOptional()
  clientName: string | null;

  @ApiPropertyOptional()
  startDate: Date | null;

  @ApiPropertyOptional()
  endDate: Date | null;

  @ApiProperty({ enum: ProjectPriority })
  priority: ProjectPriority;

  @ApiProperty({ enum: ProjectVisibility })
  visibility: ProjectVisibility;

  @ApiProperty({ enum: ProjectStatus })
  status: ProjectStatus;

  @ApiProperty()
  isBillable: boolean;

  @ApiPropertyOptional()
  estimatedHours: number | null;

  @ApiPropertyOptional()
  budget: number | null;

  @ApiPropertyOptional()
  assignedTeamId: string | null;

  @ApiPropertyOptional()
  projectManagerId: string | null;

  @ApiPropertyOptional({ type: [String] })
  tags: string[];

  @ApiPropertyOptional({ type: [String] })
  attachments: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date | null;
}

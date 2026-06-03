import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../enums/project-status.enum';

export class ProjectStatusHistory {
  @ApiProperty()
  id: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty({ enum: ProjectStatus })
  fromStatus: ProjectStatus;

  @ApiProperty({ enum: ProjectStatus })
  toStatus: ProjectStatus;

  @ApiProperty()
  changedBy: string;

  @ApiPropertyOptional()
  note: string | null;

  @ApiProperty()
  createdAt: Date;
}

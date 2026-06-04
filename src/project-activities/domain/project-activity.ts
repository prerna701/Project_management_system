import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectActivity {
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
  actorId: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  entityType: string;

  @ApiPropertyOptional()
  entityId: string | null;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  oldValue: string | null;

  @ApiPropertyOptional()
  newValue: string | null;

  @ApiProperty()
  metadata: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;
}

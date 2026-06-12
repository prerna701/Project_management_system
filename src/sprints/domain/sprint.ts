import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SprintStatus } from '../enums/sprint-status.enum';

export class Sprint {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  goal: string | null;

  @ApiProperty({ enum: SprintStatus })
  status: SprintStatus;

  @ApiPropertyOptional()
  startDate: Date | null;

  @ApiPropertyOptional()
  endDate: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date | null;
}

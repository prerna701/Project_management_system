import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReleaseNote {
  @ApiProperty()
  id: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  version: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty({ type: [Object] })
  items: Record<string, unknown>[];

  @ApiPropertyOptional()
  releasedAt: Date | null;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

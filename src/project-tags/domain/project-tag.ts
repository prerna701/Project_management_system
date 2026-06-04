import { ApiProperty } from '@nestjs/swagger';

export class ProjectTag {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  deletedAt: Date | null;
}

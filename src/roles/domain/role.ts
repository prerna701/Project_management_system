import { ApiProperty } from '@nestjs/swagger';

export class Role {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String, example: 'Admin' })
  name?: string;

  @ApiProperty({ type: String, example: 'admin' })
  slug?: string;

  @ApiProperty({ type: Number })
  userCount?: number;

  @ApiProperty({ type: Number })
  permissionCount?: number;

  @ApiProperty({ type: () => [Object] })
  permissions?: { id: number }[];
}

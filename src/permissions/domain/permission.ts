import { ApiProperty } from '@nestjs/swagger';

export class Permission {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String, example: 'users.read' })
  name: string;

  @ApiProperty({ type: String, example: 'Read Users' })
  label?: string;

  @ApiProperty({ type: String, example: 'users' })
  module?: string;
}

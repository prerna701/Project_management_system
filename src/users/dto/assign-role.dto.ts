import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class AssignRoleDto {
  @ApiProperty({ example: 1, description: 'Role ID to assign' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  roleId: number;
}

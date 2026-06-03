import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignPermissionDto {
  @ApiProperty({ example: 1, description: 'Permission ID to assign' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  permissionId: number;
}

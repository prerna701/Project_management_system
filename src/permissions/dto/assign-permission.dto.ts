import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignPermissionDto {
  @ApiProperty({ example: 1, description: 'Permission ID to assign' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  permissionId: number;

  @ApiPropertyOptional({ example: 'PROJECT', description: 'Optional scope type' })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional({ example: 'project-uuid', description: 'Optional scoped resource id' })
  @IsOptional()
  @IsUUID()
  resourceId?: string;
}

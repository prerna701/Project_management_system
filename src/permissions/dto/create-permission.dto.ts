import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'users.read' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Read Users', required: false })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ example: 'users', required: false })
  @IsOptional()
  @IsString()
  module?: string;
}

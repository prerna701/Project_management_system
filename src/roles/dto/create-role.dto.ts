import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Manager' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'manager', required: false })
  @IsOptional()
  @IsString()
  slug?: string;
}

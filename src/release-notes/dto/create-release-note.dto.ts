import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReleaseNoteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: '1.0.0' })
  @IsNotEmpty()
  @IsString()
  version: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  items?: Record<string, unknown>[];

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsString()
  releasedAt?: string;
}

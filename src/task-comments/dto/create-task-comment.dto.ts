import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateTaskCommentDto {
  @ApiProperty({ example: 'Blocked by missing design files.' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({ type: [String], required: false, example: ['user-uuid'] })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  mentions?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

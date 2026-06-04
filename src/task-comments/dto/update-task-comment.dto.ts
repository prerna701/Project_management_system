import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateTaskCommentDto {
  @ApiProperty({ example: 'Updated comment text.' })
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

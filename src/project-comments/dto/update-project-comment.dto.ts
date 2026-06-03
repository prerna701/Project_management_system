import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateProjectCommentDto {
  @ApiProperty({ example: 'Updated comment text.' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateProjectCommentDto {
  @ApiProperty({ example: 'Looks great, moving forward.' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;
}

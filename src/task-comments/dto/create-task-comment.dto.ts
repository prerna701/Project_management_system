import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTaskCommentDto {
  @ApiProperty({ example: 'Blocked by missing design files.' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  content: string;
}

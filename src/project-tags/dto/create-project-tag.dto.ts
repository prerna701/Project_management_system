import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectTagDto {
  @ApiProperty({ example: 'Frontend' })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({ example: '#60a5fa' })
  @IsNotEmpty()
  @IsString()
  color: string;
}

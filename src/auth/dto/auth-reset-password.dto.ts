import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hash: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  password: string;
}

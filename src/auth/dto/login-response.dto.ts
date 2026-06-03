import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';

export class LoginResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  tokenExpires: number;

  @ApiProperty({ type: () => User })
  user: User;

  @ApiProperty({ type: [Object] })
  roles?: any[];

  @ApiProperty({ type: [Object] })
  permissions?: any[];
}

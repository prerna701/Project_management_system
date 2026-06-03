import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../roles/domain/role';

export class User {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String, example: 'john.doe@example.com' })
  email: string | null;

  @Exclude({ toPlainOnly: true })
  password?: string;

  @ApiProperty({ type: String, example: 'email' })
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @ApiProperty({ type: String, example: 'John' })
  firstName: string | null;

  @ApiProperty({ type: String, example: 'Doe' })
  lastName: string | null;

  @ApiProperty({ type: String, example: 'ACTIVE' })
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';

  @ApiProperty({ type: () => Role })
  @Expose({ groups: ['me', 'admin'] })
  role?: Role | null;

  @ApiProperty()
  roles?: any[] | null;

  @ApiProperty()
  permissions?: any[] | null;

  @ApiProperty({ type: String, nullable: true })
  otp?: string | null;

  @ApiProperty({ type: Date, nullable: true })
  otpExpiresAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt?: Date | null;

  @ApiProperty()
  lastLoginAt?: Date | null;
}

import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {
  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'PENDING'], required: false })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'PENDING'])
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';

  @ApiProperty({ required: false })
  @IsOptional()
  lastLoginAt?: Date;
}

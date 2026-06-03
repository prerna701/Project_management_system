import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '../../common/dto/base-query.dto';

export class UserQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({ example: 'ACTIVE', description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: '1', description: 'Filter by role ID' })
  @IsOptional()
  roleId?: string;
}

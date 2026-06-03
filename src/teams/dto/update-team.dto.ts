import { PartialType } from '@nestjs/swagger';
import { CreateTeamDto } from './create-team.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

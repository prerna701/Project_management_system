import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { CreateTeamMemberDto } from './create-team.dto';

export class AddTeamMembersDto {
  @ApiProperty({ type: [CreateTeamMemberDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateTeamMemberDto)
  members: CreateTeamMemberDto[];
}

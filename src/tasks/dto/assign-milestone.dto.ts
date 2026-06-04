import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class AssignMilestoneDto {
  @ApiPropertyOptional({
    example: 'milestone-uuid',
    nullable: true,
    description: 'UUID of milestone to assign to. Pass null to remove task from its current milestone.',
  })
  @ValidateIf((o) => o.milestoneId !== null && o.milestoneId !== undefined)
  @IsOptional()
  @IsUUID()
  milestoneId?: string | null;
}

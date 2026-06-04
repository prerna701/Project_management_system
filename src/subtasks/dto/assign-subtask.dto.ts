import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class AssignSubtaskDto {
  @ApiPropertyOptional({ example: 'user-uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;
}

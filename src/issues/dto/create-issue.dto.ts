import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { IssueStatus } from '../enums/issue-status.enum';

export class CreateIssueDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  milestoneId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  taskId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  subtaskId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: IssueStatus, default: IssueStatus.OPEN })
  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;
}

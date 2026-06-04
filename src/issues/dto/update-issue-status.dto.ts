import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { IssueStatus } from '../enums/issue-status.enum';

export class UpdateIssueStatusDto {
  @ApiProperty({ enum: IssueStatus })
  @IsNotEmpty()
  @IsEnum(IssueStatus)
  status: IssueStatus;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInvitationTemplateDto {
  @ApiProperty({ example: 'Client Welcome' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'client', description: 'Type of user this template targets' })
  @IsNotEmpty()
  @IsString()
  userType: string;

  @ApiProperty({ example: 'You have been invited to ViewRay' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ example: 'Dear {{name}}, you have been invited...' })
  @IsNotEmpty()
  @IsString()
  content: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendInvitationDto {
  @ApiProperty({ example: 'client@example.com' })
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Recipient name for template interpolation' })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({ description: 'Override subject before sending' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Override content before sending' })
  @IsOptional()
  @IsString()
  content?: string;
}

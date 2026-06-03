import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddClientDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: 'client', description: 'Role label for this client on the project' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: 'template-uuid', description: 'Invitation template to use when emailing the client' })
  @IsOptional()
  @IsUUID()
  templateId?: string;
}

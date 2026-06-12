import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatHistoryItemDto {
  @ApiProperty({ enum: ['user', 'model'] })
  @IsString()
  role: 'user' | 'model';

  @ApiProperty()
  @IsString()
  text: string;
}

export class ChatMessageDto {
  @ApiProperty({ example: 'Create a task called Fix login bug under ViewRay project' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiPropertyOptional({ type: [ChatHistoryItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  history?: ChatHistoryItemDto[];
}

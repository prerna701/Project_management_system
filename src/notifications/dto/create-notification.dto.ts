import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../enums/notification-type.enum';

export class CreateNotificationDto {
  @IsUUID()
  recipientId: string;

  @IsOptional()
  @IsUUID()
  triggeredById?: string | null;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  entityType?: string | null;

  @IsOptional()
  @IsString()
  entityId?: string | null;

  @IsOptional()
  @IsString()
  redirectUrl?: string | null;

  @IsOptional()
  metadata?: Record<string, any> | null;
}

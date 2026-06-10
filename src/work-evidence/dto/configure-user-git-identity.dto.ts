import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class ConfigureUserGitIdentityDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

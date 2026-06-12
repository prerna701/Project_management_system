import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateGitIntegrationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  apiBaseUrl?: string;

  @IsOptional()
  @IsString()
  tokenEnvKey?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

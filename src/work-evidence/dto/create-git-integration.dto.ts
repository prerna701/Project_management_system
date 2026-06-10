import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateGitIntegrationDto {
  @IsString()
  name: string;

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

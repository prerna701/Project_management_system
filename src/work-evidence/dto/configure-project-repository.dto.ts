import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class ConfigureProjectRepositoryDto {
  @IsUUID()
  integrationId: string;

  @IsString()
  owner: string;

  @IsString()
  repository: string;

  @IsOptional()
  @IsString()
  defaultBranch?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

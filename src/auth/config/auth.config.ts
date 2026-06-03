import { registerAs } from '@nestjs/config';
import { IsOptional, IsString, IsInt } from 'class-validator';
import validateConfig from '../../common/utils/validate-config';
import { AuthConfig } from './auth-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  AUTH_JWT_SECRET: string;

  @IsString()
  @IsOptional()
  AUTH_JWT_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsOptional()
  AUTH_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  AUTH_REFRESH_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsOptional()
  AUTH_FORGOT_SECRET: string;

  @IsString()
  @IsOptional()
  AUTH_FORGOT_TOKEN_EXPIRES_IN: string;

  @IsString()
  @IsOptional()
  AUTH_CONFIRM_EMAIL_SECRET: string;

  @IsString()
  @IsOptional()
  AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN: string;

  @IsInt()
  @IsOptional()
  OTP_EXPIRES_IN_MINUTES: number;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    secret: process.env.AUTH_JWT_SECRET,
    expires: process.env.AUTH_JWT_TOKEN_EXPIRES_IN,
    refreshSecret: process.env.AUTH_REFRESH_SECRET,
    refreshExpires: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN,
    forgotSecret: process.env.AUTH_FORGOT_SECRET,
    forgotExpires: process.env.AUTH_FORGOT_TOKEN_EXPIRES_IN,
    confirmEmailSecret: process.env.AUTH_CONFIRM_EMAIL_SECRET,
    confirmEmailExpires: process.env.AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN,
    otpExpiresInMinutes: process.env.OTP_EXPIRES_IN_MINUTES
      ? parseInt(process.env.OTP_EXPIRES_IN_MINUTES, 10)
      : 10,
  };
});

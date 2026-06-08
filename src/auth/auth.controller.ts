import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthConfirmOtpDto } from './dto/auth-confirm-otp.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { createResponse } from '../common/utils/base-response';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('email/login')
  @ApiOkResponse({ type: LoginResponseDto })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: AuthEmailLoginDto) {
    const result = await this.authService.validateLogin(loginDto);
    return createResponse('Login successful', result);
  }

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() body: { email: string }) {
    await this.authService.sendOtp(body.email);
    return createResponse('OTP sent to your email', null);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: AuthConfirmOtpDto) {
    const result = await this.authService.verifyOtp(dto.email, dto.otp);
    return createResponse('Account activated and logged in successfully', result);
  }

  @Get('otp/start')
  async startOtpVerification(
    @Query('email') email: string,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.authService.startOtpVerification(email);
    return res.redirect(302, redirectUrl);
  }

  @Post('forgot/password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: AuthForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return createResponse('Password reset link sent', null);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: AuthResetPasswordDto) {
    await this.authService.resetPassword(dto.hash, dto.password);
    return createResponse('Password reset successfully', null);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@CurrentUser() userPayload: JwtPayloadType) {
    const user = await this.authService.me(userPayload);
    return createResponse('User profile fetched', user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  @HttpCode(HttpStatus.OK)
  async my(@CurrentUser() userPayload: JwtPayloadType) {
    const data = await this.authService.myData(userPayload.id);
    return createResponse('User context fetched', data);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@CurrentUser() userPayload: JwtRefreshPayloadType) {
    const result = await this.authService.refreshToken(userPayload);
    return createResponse('Token refreshed', result);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() userPayload: JwtPayloadType) {
    await this.authService.logout(userPayload);
    return createResponse('Logged out successfully. Verification email sent again.', null);
  }
}

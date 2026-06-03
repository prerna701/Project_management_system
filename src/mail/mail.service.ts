import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../mailer/mailer.service';
import { User } from '../users/domain/user';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async sendWelcomeEmail(user: User): Promise<void> {
    const verificationLink = this.buildOtpStartLink(user.email!);

    await this.mailerService.sendMail({
      to: user.email!,
      subject: 'Welcome! Please verify your account',
      html: `
        <h2>Welcome!</h2>
        <p>Hi ${user.firstName || user.email},</p>
        <p>Your account has been created. Click the button below to receive your OTP and verify your account.</p>
        <a href="${verificationLink}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;">
          Verify Account
        </a>
        <p>After clicking, we will send an OTP to this email and open the verification screen.</p>
        <p>If you did not request this account, please ignore this email.</p>
      `,
    });
  }

  async sendOtpEmail(
    user: User,
    otp: string,
    expiresInMinutes = 10,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: user.email!,
      subject: 'Your OTP Verification Code',
      html: `
        <h2>OTP Verification</h2>
        <p>Hi ${user.firstName || user.email},</p>
        <p>Your OTP code is: <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p>
        <p>This OTP is valid for <strong>${expiresInMinutes} minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  }

  async sendForgotPasswordEmail(user: User, hash: string): Promise<void> {
    const frontendDomain = process.env.FRONTEND_DOMAIN || 'http://localhost:3000';
    const resetLink = `${frontendDomain}/auth/reset-password?hash=${hash}`;

    await this.mailerService.sendMail({
      to: user.email!,
      subject: 'Reset Your Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${user.firstName || user.email},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">
          Reset Password
        </a>
        <p>This link expires in 30 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  }

  private buildOtpStartLink(email: string): string {
    const backendDomain =
      this.configService.get('app.backendDomain', { infer: true }) ||
      'http://localhost:7000';
    const apiPrefix =
      this.configService.get('app.apiPrefix', { infer: true }) || 'api';

    return `${backendDomain.replace(/\/$/, '')}/${apiPrefix.replace(/^\/|\/$/g, '')}/v1/auth/otp/start?email=${encodeURIComponent(email)}`;
  }
}

import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { TryCatch } from '../common/utils/try-catch.util';
import ms, { StringValue } from 'ms';
import { AllConfigType } from '../config/config.type';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { TeamMemberEntity } from '../teams/infrastructure/persistence/relational/entities/team-member.entity';
import { TeamEntity } from '../teams/infrastructure/persistence/relational/entities/team.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
    @InjectRepository(TeamMemberEntity)
    private readonly teamMemberRepo: Repository<TeamMemberEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamRepo: Repository<TeamEntity>,
  ) {}

  @TryCatch('Login failed')
  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { email: 'userNotFound' },
      });
    }

    if (!user.password) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { password: 'incorrectPassword' },
      });
    }

    const isValidPassword = await bcrypt.compare(loginDto.password, user.password);
    if (!isValidPassword) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Invalid email or password',
        errors: { password: 'incorrectPassword' },
      });
    }

    if (user.status !== 'ACTIVE') {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Account is not activated. Please check your email for OTP.',
        errors: { status: 'inactiveUser' },
      });
    }

    await this.usersService.update(user.id, { lastLoginAt: new Date() });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({ id: user.id, role: user.role });

    const roles = await this.usersService.getUserRoles(user.id);
    const permissions = await this.usersService.getUserPermissions(user.id);

    return {
      token,
      refreshToken,
      tokenExpires,
      user,
      roles,
      permissions,
    };
  }

  async sendOtp(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException({ errors: { email: 'userNotFound' } });
    }
    await this.usersService.generateAndSendOtp(user);
  }

  async verifyOtp(email: string, otp: string): Promise<LoginResponseDto> {
    const user = await this.usersService.verifyOtp(email, otp);
    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { email: 'userNotFound' },
      });
    }

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.role,
    });
    const roles = await this.usersService.getUserRoles(user.id);
    const permissions = await this.usersService.getUserPermissions(user.id);

    return {
      token,
      refreshToken,
      tokenExpires,
      user,
      roles,
      permissions,
    };
  }

  async startOtpVerification(email: string): Promise<string> {
    await this.sendOtp(email);

    const frontendDomain =
      this.configService.get('app.frontendDomain', { infer: true }) ||
      'http://localhost:3000';
    return `${frontendDomain.replace(/\/$/, '')}/auth/verify-account?email=${encodeURIComponent(email)}`;
  }

  @TryCatch('Failed to process forgot password')
  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { email: 'emailNotExists' },
      });
    }

    const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', { infer: true });
    const hash = await this.jwtService.signAsync(
      { forgotUserId: user.id },
      {
        secret: this.configService.getOrThrow('auth.forgotSecret', { infer: true }),
        expiresIn: tokenExpiresIn,
      },
    );

    await this.mailService.sendForgotPasswordEmail(user, hash);
  }

  @TryCatch('Failed to reset password')
  async resetPassword(hash: string, password: string): Promise<void> {
    let userId: string;
    try {
      const jwtData = await this.jwtService.verifyAsync<{ forgotUserId: string }>(hash, {
        secret: this.configService.getOrThrow('auth.forgotSecret', { infer: true }),
      });
      userId = jwtData.forgotUserId;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { hash: 'invalidHash' },
      });
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { hash: 'notFound' },
      });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.usersService.update(user.id, { password: hashedPassword } as any);
  }

  async me(userJwtPayload: JwtPayloadType): Promise<any> {
    const user = await this.usersService.findById(userJwtPayload.id);
    if (!user) return null;

    const roles = await this.usersService.getUserRoles(userJwtPayload.id);
    const permissions = await this.usersService.getUserPermissions(userJwtPayload.id);

    return { ...user, roles, permissions };
  }

  async myData(userId: string): Promise<{ teamIds: string[] }> {
    const [memberships, ledTeams] = await Promise.all([
      this.teamMemberRepo.find({
        where: { userId, isActive: true },
        select: ['teamId'],
      }),
      this.teamRepo.find({
        where: { teamLeadId: userId, isActive: true },
        select: ['id'],
      }),
    ]);
    const memberTeamIds = memberships.map((m) => m.teamId);
    const ledTeamIds = ledTeams.map((t) => t.id);
    return { teamIds: [...new Set([...memberTeamIds, ...ledTeamIds])] };
  }

  async refreshToken(data: Pick<JwtRefreshPayloadType, 'id'>): Promise<Omit<LoginResponseDto, 'user' | 'roles' | 'permissions'>> {
    const user = await this.usersService.findById(data.id);
    if (!user?.role) throw new UnauthorizedException();
    if (user.status !== 'ACTIVE') throw new UnauthorizedException();

    const { token, refreshToken, tokenExpires } = await this.getTokensData({ id: user.id, role: user.role });
    return { token, refreshToken, tokenExpires };
  }

  async logout(userJwtPayload: JwtPayloadType): Promise<void> {
    const user = await this.usersService.findById(userJwtPayload.id);
    if (!user) throw new UnauthorizedException();
  }

  private async getTokensData(data: { id: string; role?: any }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', { infer: true });
    const tokenExpires = Date.now() + ms(tokenExpiresIn as StringValue);

    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id: data.id, role: data.role },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        { id: data.id },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', { infer: true }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', { infer: true }),
        },
      ),
    ]);

    return { token, refreshToken, tokenExpires };
  }
}

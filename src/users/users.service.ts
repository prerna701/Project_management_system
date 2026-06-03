import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { User } from './domain/user';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NullableType } from '../common/types/nullable.type';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { TryCatch } from '../common/utils/try-catch.util';
import { MailService } from '../mail/mail.service';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  @TryCatch('Failed to create user')
  async create(dto: CreateUserDto): Promise<User> {
    if (dto.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { email: 'emailAlreadyExists' },
        });
      }
    }

    let password: string | undefined;
    if (dto.password) {
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(dto.password, salt);
    }

    const user = await this.userRepository.create({
      ...dto,
      password,
      provider: 'email',
      status: 'PENDING',
    });

    // Fire-and-forget — never fail user creation because of a mail error
    this.mailService.sendWelcomeEmail(user).catch(() => null);

    return user;
  }

  async findById(id: string, withRelations = false): Promise<NullableType<User>> {
    return this.userRepository.findById(id, withRelations);
  }

  async findByEmail(email: string): Promise<NullableType<User>> {
    return this.userRepository.findByEmail(email);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  @TryCatch('Failed to fetch users')
  async findManyWithPagination(options: {
    paginationOptions: IPaginationOptions;
    search?: string;
  }): Promise<{ data: User[]; meta: PaginationMetaDto }> {
    const result = await this.userRepository.findManyWithPagination(options);
    return { data: result.items, meta: result.meta };
  }

  @TryCatch('Failed to update user')
  async update(id: string, payload: UpdateUserDto | Partial<User>): Promise<NullableType<User>> {
    return this.userRepository.update(id, payload as Partial<User>);
  }

  @TryCatch('Failed to remove user')
  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User #${id} not found`);
    await this.userRepository.remove(id);
  }

  @TryCatch('Failed to assign role')
  async assignRole(userId: string, roleId: number): Promise<void> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException(`User #${userId} not found`);
    await this.userRepository.assignRole(userId, roleId);
  }

  async removeRole(userId: string, roleId: number): Promise<void> {
    await this.userRepository.removeRole(userId, roleId);
  }

  async getUserRoles(userId: string): Promise<any[]> {
    return this.userRepository.getUserRoles(userId);
  }

  async getUserPermissions(userId: string): Promise<any[]> {
    const roles = await this.getUserRoles(userId);
    const roleIds = roles.map((r) => r.id as number);
    return this.userRepository.getUserPermissions(userId, roleIds);
  }

  @TryCatch('Failed to generate OTP')
  async generateAndSendOtp(user: User): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresInMinutes =
      this.configService.get('auth.otpExpiresInMinutes', { infer: true }) ?? 10;
    const otpExpiresAt = new Date(Date.now() + otpExpiresInMinutes * 60 * 1000);

    await this.userRepository.update(user.id, { otp, otpExpiresAt } as any);
    await this.mailService.sendOtpEmail(user, otp, otpExpiresInMinutes);
  }

  @TryCatch('OTP verification failed')
  async verifyOtp(email: string, otp: string): Promise<NullableType<User>> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { email: 'userNotFound' },
      });
    }

    if (user.otp !== otp) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { otp: 'invalidOtp' },
      });
    }

    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { otp: 'otpExpired' },
      });
    }

    await this.userRepository.update(user.id, {
      status: 'ACTIVE',
      otp: null,
      otpExpiresAt: null,
    } as any);

    return this.findById(user.id);
  }
}

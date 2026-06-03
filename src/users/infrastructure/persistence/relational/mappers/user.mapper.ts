import { User } from '../../../../domain/user';
import { UserEntity } from '../entities/user.entity';
import { RoleMapper } from '../../../../../roles/infrastructure/persistence/relational/mappers/role.mapper';

export class UserMapper {
  static toDomain(raw: UserEntity): User {
    const user = new User();
    user.id = raw.id;
    user.email = raw.email;
    user.password = raw.password ?? undefined;
    user.provider = raw.provider;
    user.firstName = raw.firstName;
    user.lastName = raw.lastName;
    user.status = raw.status;
    user.otp = raw.otp;
    user.otpExpiresAt = raw.otpExpiresAt;
    user.lastLoginAt = raw.lastLoginAt;
    user.createdAt = raw.createdAt;
    user.updatedAt = raw.updatedAt;
    user.deletedAt = raw.deletedAt;
    if (raw.role) user.role = RoleMapper.toDomain(raw.role);
    return user;
  }

  static toPersistence(user: User): UserEntity {
    const entity = new UserEntity();
    if (user.id) entity.id = user.id;
    entity.email = user.email;
    if (user.password !== undefined) entity.password = user.password ?? null;
    entity.provider = user.provider ?? 'email';
    entity.firstName = user.firstName;
    entity.lastName = user.lastName;
    entity.status = user.status ?? 'PENDING';
    if (user.otp !== undefined) entity.otp = user.otp ?? null;
    if (user.otpExpiresAt !== undefined) entity.otpExpiresAt = user.otpExpiresAt ?? null;
    if (user.lastLoginAt !== undefined) entity.lastLoginAt = user.lastLoginAt ?? null;
    return entity;
  }
}

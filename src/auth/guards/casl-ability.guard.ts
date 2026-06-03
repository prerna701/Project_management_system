import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { defineAbilitiesFor, Actions, Subjects } from '../abilities';
import { UserRepository } from '../../users/infrastructure/persistence/user.repository';

/**
 * Registered as a global APP_GUARD in AppModule.
 * Only enforces abilities when a handler is decorated with @SetMetadata('abilities', [...]).
 * Injects UserRepository directly to avoid circular deps (AuthModule ↔ UsersModule).
 */
@Injectable()
export class CaslAbilityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAbilities = this.reflector.get<[Actions, Subjects][]>(
      'abilities',
      context.getHandler(),
    );
    if (!requiredAbilities) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // No user on request → skip (JWT guard handles auth separately)
    if (!user?.id) return true;

    const userRoles = await this.userRepository.getUserRoles(user.id);

    // Merge token role if not already present
    if (user.role && !userRoles.some((r: any) => r.id === user.role?.id)) {
      userRoles.push(user.role);
    }

    const rolesName = userRoles
      .filter(Boolean)
      .map((role: any) => ({ id: role.id, name: role.name }));

    const roleIds = rolesName.map((r: any) => r.id as number);
    const allPermissions = await this.userRepository.getUserPermissions(user.id, roleIds);

    const permissionLabels = allPermissions
      .map((p: any) => p.name)
      .filter(Boolean) as string[];

    const ability = defineAbilitiesFor(user, permissionLabels, rolesName);

    for (const [action, subject] of requiredAbilities) {
      if (!ability.can(action, subject)) {
        throw new ForbiddenException(`You are not allowed to ${action} ${subject}`);
      }
    }

    return true;
  }
}

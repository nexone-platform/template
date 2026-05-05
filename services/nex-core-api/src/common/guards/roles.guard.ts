import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator = allow all authenticated users
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึง');

    const hasRole = requiredRoles.some(role =>
      user.roleName?.toLowerCase().includes(role.toLowerCase())
    );

    if (!hasRole) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์เข้าถึงฟังก์ชันนี้');
    }

    return true;
  }
}

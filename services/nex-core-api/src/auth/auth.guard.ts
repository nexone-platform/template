import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip auth for @Public() routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();

    // Read session ID from HttpOnly cookie
    const sessionId = request.cookies?.['nexone_sid'];
    if (!sessionId) {
      throw new UnauthorizedException('กรุณาเข้าสู่ระบบ');
    }

    const result = await this.authService.validateSession(sessionId);
    if (!result) {
      throw new UnauthorizedException('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
    }

    // Attach user + session info to request for downstream usage
    request.user = {
      userId: result.user.id,
      email: result.user.email,
      roleId: result.user.roleId,
      roleName: result.user.roleName,
    };
    request.sessionId = result.session.id;

    return true;
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('กรุณาเข้าสู่ระบบ');
    }

    const token = authHeader.slice(7);
    const decoded = this.authService.verifyToken(token);

    if (!decoded) {
      throw new UnauthorizedException('Token หมดอายุหรือไม่ถูกต้อง');
    }

    // Attach user info to request for downstream usage
    request.user = decoded;
    return true;
  }
}

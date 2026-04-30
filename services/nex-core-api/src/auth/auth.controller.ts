import { Controller, Post, Get, Body, UseGuards, Req, Res, Query } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';
import { AuthGuard } from './auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditLog } from '../common/decorators/audit-log.decorator';
import { ConfigService } from '@nestjs/config';

const COOKIE_NAME = 'nexone_sid';

@Controller('auth')
export class AuthController {
  private readonly cookieMaxAge: number;
  private readonly isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {
    this.cookieMaxAge = this.config.get('SESSION_TTL_SECONDS', 28800) * 1000;
    this.isProduction = this.config.get('NODE_ENV') === 'production';
  }

  @Post('login')
  @Public()   // ← No auth required
  @Throttle({ default: { limit: 5, ttl: 60000 } })  // ← 5 attempts per 60s per IP
  @AuditLog('Auth', 'Login')
  async login(@Body() dto: LoginDto, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || '';

    const result = await this.authService.login(dto, ip, ua);

    // Set HttpOnly cookie — cannot be read by JavaScript (XSS-safe)
    res.cookie(COOKIE_NAME, result.sessionId, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      maxAge: this.cookieMaxAge,
      path: '/',
    });

    return { user: result.user, message: 'เข้าสู่ระบบสำเร็จ' };
  }

  @Post('register')
  @Public()   // ← No auth required
  @Throttle({ default: { limit: 3, ttl: 60000 } })  // ← 3 registrations per 60s per IP
  @AuditLog('Auth', 'Register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @SkipThrottle()
  @AuditLog('Auth', 'Get Profile')
  async me(@Req() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('logout')
  @AuditLog('Auth', 'Logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.sessionId);
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { message: 'ออกจากระบบสำเร็จ' };
  }

  @Post('logout-all')
  @AuditLog('Auth', 'Logout All Devices')
  async logoutAll(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.revokeAllSessions(req.user.userId);
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return { message: 'ออกจากระบบทุกอุปกรณ์สำเร็จ' };
  }

  @Post('change-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @AuditLog('Auth', 'Change Password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.changePassword(req.user.userId, dto);
    res.clearCookie(COOKIE_NAME, { path: '/' });
    return result;
  }

  @Get('sessions')
  @AuditLog('Auth', 'List Sessions')
  async sessions(@Req() req: any) {
    return this.authService.listSessions(req.user.userId);
  }

  @Get('users')
  @Roles('admin')  // ← Admin only
  @AuditLog('Auth', 'List Users')
  async listUsers(@Query('page') page: string, @Query('limit') limit: string) {
    return this.authService.listUsers(Number(page) || 1, Number(limit) || 20);
  }
}

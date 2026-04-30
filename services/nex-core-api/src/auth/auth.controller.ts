import { Controller, Post, Get, Body, UseGuards, Req, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';
import { AuthGuard } from './auth.guard';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @AuditLog('Auth', 'Login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @AuditLog('Auth', 'Register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @AuditLog('Auth', 'Get Profile')
  async me(@Req() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @AuditLog('Auth', 'Change Password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, dto);
  }

  @Get('users')
  @UseGuards(AuthGuard)
  @AuditLog('Auth', 'List Users')
  async listUsers(@Query('page') page: string, @Query('limit') limit: string) {
    return this.authService.listUsers(Number(page) || 1, Number(limit) || 20);
  }
}

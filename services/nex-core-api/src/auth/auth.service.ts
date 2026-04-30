import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly tokenExpiry: number; // seconds

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly config: ConfigService,
  ) {
    this.jwtSecret = this.config.get('JWT_SECRET', 'nexone-template-secret-change-me');
    this.tokenExpiry = this.config.get('JWT_EXPIRY_SECONDS', 28800); // 8 hours
  }

  // ── Login ─────────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    if (!user.isActive) throw new UnauthorizedException('บัญชีถูกระงับ กรุณาติดต่อผู้ดูแลระบบ');

    const isValid = this.verifyPassword(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    const accessToken = this.generateToken(user);
    const appAccess = this.parseAppAccess(user.appAccess);

    return {
      user: {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        roleId: user.roleId,
        roleName: user.roleName,
        isActive: user.isActive,
        employeeId: user.employeeId,
        avatarUrl: user.avatarUrl,
        appAccess,
      },
      accessToken,
      expiresIn: this.tokenExpiry,
    };
  }

  // ── Register ──────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');

    const user = this.userRepo.create({
      email: dto.email,
      password: this.hashPassword(dto.password),
      displayName: dto.displayName || dto.email.split('@')[0],
      roleId: dto.roleId || 2,
      roleName: dto.roleId === 1 ? 'admin' : 'user',
      appAccess: JSON.stringify(['nex-core']),
      createBy: 'system',
    });

    const saved = await this.userRepo.save(user);
    return {
      userId: saved.id,
      email: saved.email,
      displayName: saved.displayName,
      message: 'ลงทะเบียนสำเร็จ',
    };
  }

  // ── Me (Profile) ──────────────────────────────────────────────────
  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('ไม่พบผู้ใช้');

    return {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      roleId: user.roleId,
      roleName: user.roleName,
      isActive: user.isActive,
      employeeId: user.employeeId,
      avatarUrl: user.avatarUrl,
      appAccess: this.parseAppAccess(user.appAccess),
      lastLoginAt: user.lastLoginAt,
    };
  }

  // ── Change Password ───────────────────────────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('ไม่พบผู้ใช้');

    const isValid = this.verifyPassword(dto.currentPassword, user.password);
    if (!isValid) throw new UnauthorizedException('รหัสผ่านปัจจุบันไม่ถูกต้อง');

    user.password = this.hashPassword(dto.newPassword);
    user.updateBy = userId;
    await this.userRepo.save(user);

    return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
  }

  // ── Verify Token ──────────────────────────────────────────────────
  verifyToken(token: string): { userId: string; email: string; roleId: number } | null {
    try {
      const [headerB64, payloadB64, signature] = token.split('.');
      const expectedSig = this.hmacSign(`${headerB64}.${payloadB64}`);
      if (signature !== expectedSig) return null;

      const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
      if (payload.exp && Date.now() / 1000 > payload.exp) return null;

      return { userId: payload.sub, email: payload.email, roleId: payload.roleId };
    } catch {
      return null;
    }
  }

  // ── List Users (Admin) ────────────────────────────────────────────
  async listUsers(page = 1, limit = 20) {
    const [users, total] = await this.userRepo.findAndCount({
      select: ['id', 'email', 'displayName', 'roleId', 'roleName', 'isActive', 'employeeId', 'lastLoginAt', 'createDate'],
      order: { createDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: users, total, page, limit };
  }

  // ══════════════════════════════════════════════════════════════════
  // Private helpers
  // ══════════════════════════════════════════════════════════════════

  private hashPassword(plain: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(plain, salt, 100_000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(plain: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const test = crypto.pbkdf2Sync(plain, salt, 100_000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
  }

  private generateToken(user: User): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.tokenExpiry,
    })).toString('base64url');
    const signature = this.hmacSign(`${header}.${payload}`);
    return `${header}.${payload}.${signature}`;
  }

  private hmacSign(data: string): string {
    return crypto.createHmac('sha256', this.jwtSecret).update(data).digest('base64url');
  }

  private parseAppAccess(raw: string | null): string[] {
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  }
}

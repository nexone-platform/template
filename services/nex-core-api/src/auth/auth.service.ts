import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';

const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_MINUTES = 30;

@Injectable()
export class AuthService {
  private readonly sessionTTL: number; // seconds

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Session) private readonly sessionRepo: Repository<Session>,
    private readonly config: ConfigService,
  ) {
    this.sessionTTL = this.config.get('SESSION_TTL_SECONDS', 28800); // 8 hours
  }

  // ── Login ─────────────────────────────────────────────────────────
  async login(dto: LoginDto, ip: string, userAgent: string) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    if (!user.isActive) throw new UnauthorizedException('บัญชีถูกระงับ กรุณาติดต่อผู้ดูแลระบบ');

    // ── Account Lockout Check ──
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`บัญชีถูกล็อค กรุณารอ ${remaining} นาที`);
    }

    const isValid = this.verifyPassword(dto.password, user.password);
    if (!isValid) {
      // ── Increment failed attempts ──
      user.failedLoginCount = (user.failedLoginCount || 0) + 1;
      if (user.failedLoginCount >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60_000);
        await this.userRepo.save(user);
        throw new ForbiddenException(`ใส่รหัสผ่านผิดเกิน ${MAX_FAILED_ATTEMPTS} ครั้ง บัญชีถูกล็อค ${LOCKOUT_MINUTES} นาที`);
      }
      await this.userRepo.save(user);
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    // ── Login success — reset failed attempts ──
    user.failedLoginCount = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    // Create session
    const session = await this.createSession(user, ip, userAgent);

    return {
      sessionId: session.id,
      user: this.toUserDto(user),
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
      roleId: 2,           // Always default role (never accept from client)
      roleName: 'user',    // Always default role
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

  // ── Validate Session (used by Guard) ──────────────────────────────
  async validateSession(sessionId: string): Promise<{ user: User; session: Session } | null> {
    if (!sessionId) return null;

    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, isActive: true },
      relations: ['user'],
    });

    if (!session) return null;
    if (new Date() > session.expiresAt) {
      session.isActive = false;
      await this.sessionRepo.save(session);
      return null;
    }

    // Check if user account is still active
    if (!session.user.isActive) {
      session.isActive = false;
      await this.sessionRepo.save(session);
      return null;
    }

    // Update last activity (throttle to every 60s to reduce writes)
    const now = new Date();
    const sinceLastActivity = now.getTime() - session.lastActivityAt.getTime();
    if (sinceLastActivity > 60_000) {
      session.lastActivityAt = now;
      await this.sessionRepo.save(session);
    }

    return { user: session.user, session };
  }

  // ── Me (Profile) ──────────────────────────────────────────────────
  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('ไม่พบผู้ใช้');
    return this.toUserDto(user);
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

    // Invalidate all sessions (force re-login everywhere)
    await this.revokeAllSessions(userId);

    return { message: 'เปลี่ยนรหัสผ่านสำเร็จ — กรุณาเข้าสู่ระบบใหม่' };
  }

  // ── Logout (single session) ───────────────────────────────────────
  async logout(sessionId: string) {
    await this.sessionRepo.update(sessionId, { isActive: false });
    return { message: 'ออกจากระบบสำเร็จ' };
  }

  // ── Logout All (force logout ทุกอุปกรณ์) ──────────────────────────
  async revokeAllSessions(userId: string, exceptSessionId?: string) {
    const qb = this.sessionRepo.createQueryBuilder()
      .update(Session)
      .set({ isActive: false })
      .where('user_id = :userId', { userId })
      .andWhere('is_active = true');

    if (exceptSessionId) {
      qb.andWhere('id != :sid', { sid: exceptSessionId });
    }

    await qb.execute();
    return { message: 'ออกจากระบบทุกอุปกรณ์สำเร็จ' };
  }

  // ── List Active Sessions ──────────────────────────────────────────
  async listSessions(userId: string) {
    const sessions = await this.sessionRepo.find({
      where: { userId, isActive: true },
      order: { lastActivityAt: 'DESC' },
    });

    return sessions.map(s => ({
      id: s.id.slice(0, 8) + '...',
      ipAddress: s.ipAddress,
      deviceName: s.deviceName || this.parseDevice(s.userAgent),
      createdAt: s.createdAt,
      lastActivityAt: s.lastActivityAt,
      expiresAt: s.expiresAt,
    }));
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

  // ── Scheduled: Cleanup expired sessions daily at 3am ──────────────
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredSessions() {
    const result = await this.sessionRepo.delete({
      expiresAt: LessThan(new Date()),
    });
    console.log(`[Session Cleanup] Deleted ${result.affected || 0} expired sessions`);
    return { deleted: result.affected || 0 };
  }

  // ══════════════════════════════════════════════════════════════════
  // Private helpers
  // ══════════════════════════════════════════════════════════════════

  private async createSession(user: User, ip: string, userAgent: string): Promise<Session> {
    const sessionId = crypto.randomBytes(64).toString('hex');
    const session = this.sessionRepo.create({
      id: sessionId,
      userId: user.id,
      ipAddress: ip,
      userAgent: userAgent,
      deviceName: this.parseDevice(userAgent),
      isActive: true,
      expiresAt: new Date(Date.now() + this.sessionTTL * 1000),
    });
    return this.sessionRepo.save(session);
  }

  private toUserDto(user: User) {
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

  private parseAppAccess(raw: string | null): string[] {
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  }

  private parseDevice(ua: string | null): string {
    if (!ua) return 'Unknown';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Mac')) return 'Mac';
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Linux')) return 'Linux';
    return 'Browser';
  }
}

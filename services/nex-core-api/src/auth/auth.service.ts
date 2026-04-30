import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';

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

    const isValid = this.verifyPassword(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

    // Update last login
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

  // ── Validate Session (used by Guard) ──────────────────────────────
  async validateSession(sessionId: string): Promise<{ user: User; session: Session } | null> {
    if (!sessionId) return null;

    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, isActive: true },
      relations: ['user'],
    });

    if (!session) return null;
    if (new Date() > session.expiresAt) {
      // Expired — mark inactive
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

    // Invalidate all other sessions (force re-login)
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

  // ── List Active Sessions (for user or admin) ─────────────────────
  async listSessions(userId: string) {
    const sessions = await this.sessionRepo.find({
      where: { userId, isActive: true },
      order: { lastActivityAt: 'DESC' },
    });

    return sessions.map(s => ({
      id: s.id.slice(0, 8) + '...', // Don't expose full session ID
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

  // ── Cleanup expired sessions (call periodically) ──────────────────
  async cleanupExpiredSessions() {
    const result = await this.sessionRepo.delete({
      expiresAt: LessThan(new Date()),
      isActive: false,
    });
    return { deleted: result.affected || 0 };
  }

  // ══════════════════════════════════════════════════════════════════
  // Private helpers
  // ══════════════════════════════════════════════════════════════════

  private async createSession(user: User, ip: string, userAgent: string): Promise<Session> {
    const sessionId = crypto.randomBytes(64).toString('hex'); // 128-char secure random ID
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

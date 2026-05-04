// @ts-nocheck
import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { TenantRegistration } from '../registration/entities/tenant-registration.entity';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';

const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_MINUTES = 30;

@Injectable()
export class AuthService {
  private readonly sessionTTL: number; // seconds
  private tenantDataSources = new Map<string, DataSource>();

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Session) private readonly sessionRepo: Repository<Session>,
    @InjectRepository(TenantRegistration) private readonly tenantRepo: Repository<TenantRegistration>,
    private readonly config: ConfigService,
  ) {
    this.sessionTTL = this.config.get('SESSION_TTL_SECONDS', 28800); // 8 hours
  }

  async getTenantDataSource(schemaName: string): Promise<DataSource> {
    if (this.tenantDataSources.has(schemaName)) {
      return this.tenantDataSources.get(schemaName)!;
    }

    const tenantDataSource = new DataSource({
      type: 'postgres',
      host: this.config.get('DATABASE_HOST', '203.151.66.51'),
      port: parseInt(this.config.get('DATABASE_PORT', '5434'), 10),
      username: this.config.get('DATABASE_USER', 'postgres'),
      password: this.config.get('DATABASE_PASSWORD', 'qwerty'),
      database: schemaName,
    });

    await tenantDataSource.initialize();
    this.tenantDataSources.set(schemaName, tenantDataSource);
    return tenantDataSource;
  }

  // ── Login ─────────────────────────────────────────────────────────
  async login(dto: LoginDto, ip: string, userAgent: string) {
    // 1. Validate Workspace ID (Company Abbreviation)
    const tenant = await this.tenantRepo.findOne({
      where: { companyAbbreviation: dto.workspaceId },
    });

    if (!tenant) throw new UnauthorizedException('ไม่พบรหัสองค์กรนี้ในระบบ กรุณาตรวจสอบอีกครั้ง');
    if (tenant.provisioningStatus !== 'completed') {
      throw new UnauthorizedException('ระบบขององค์กรท่านกำลังอยู่ระหว่างการจัดสร้าง');
    }

    const schemaName = tenant.schemaName;
    if (!schemaName) throw new UnauthorizedException('ข้อมูลองค์กรไม่สมบูรณ์ (Missing Schema)');

    // 2. Connect to Tenant Database
    const tenantDb = await this.getTenantDataSource(schemaName);

    // 3. Find User in Tenant Database
    const users = await tenantDb.query(`SELECT * FROM nex_core.users WHERE email = $1`, [dto.email]);
    if (users.length === 0) throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');

    const user = users[0];
    if (!user.is_active) throw new UnauthorizedException('บัญชีถูกระงับ กรุณาติดต่อผู้ดูแลระบบ');

    // ── Account Lockout Check ──
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      const remaining = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`บัญชีถูกล็อค กรุณารอ ${remaining} นาที`);
    }

    const isValid = this.verifyPassword(dto.password, user.password);
    if (!isValid) {
      // ── Increment failed attempts ──
      const failedCount = (user.failed_login_count || 0) + 1;
      if (failedCount >= MAX_FAILED_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60_000);
        await tenantDb.query(`UPDATE nex_core.users SET failed_login_count = $1, locked_until = $2 WHERE id = $3`, [failedCount, lockedUntil, user.id]);
        throw new ForbiddenException(`ใส่รหัสผ่านผิดเกิน ${MAX_FAILED_ATTEMPTS} ครั้ง บัญชีถูกล็อค ${LOCKOUT_MINUTES} นาที`);
      }
      await tenantDb.query(`UPDATE nex_core.users SET failed_login_count = $1 WHERE id = $2`, [failedCount, user.id]);
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    // ── Login success — reset failed attempts ──
    await tenantDb.query(`UPDATE nex_core.users SET failed_login_count = 0, locked_until = NULL, last_login_at = NOW() WHERE id = $1`, [user.id]);

    // Create session in Master Database (with schemaName attached)
    const session = await this.createSession(user.id, schemaName, ip, userAgent);

    return {
      sessionId: session.id,
      user: this.toUserDtoRaw(user),
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
  async validateSession(sessionId: string): Promise<{ user: any; session: Session } | null> {
    if (!sessionId) return null;

    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, isActive: true },
    });

    if (!session) return null;
    if (new Date() > session.expiresAt) {
      session.isActive = false;
      await this.sessionRepo.save(session);
      return null;
    }

    // Fetch user from Tenant Database if schemaName is present
    let userRaw = null;
    if (session.schemaName) {
      const tenantDb = await this.getTenantDataSource(session.schemaName);
      const users = await tenantDb.query(`SELECT * FROM nex_core.users WHERE id = $1`, [session.userId]);
      if (users.length > 0) userRaw = users[0];
    } else {
      // Fallback for Master Database users (e.g. system admins)
      userRaw = await this.userRepo.findOne({ where: { id: session.userId } });
    }

    if (!userRaw) return null;

    const isActive = userRaw.is_active !== undefined ? userRaw.is_active : userRaw.isActive;
    if (!isActive) {
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

    return { user: userRaw, session };
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

  private async createSession(userId: string, schemaName: string, ip: string, userAgent: string): Promise<Session> {
    const sessionId = crypto.randomBytes(64).toString('hex');
    const session = this.sessionRepo.create({
      id: sessionId,
      userId: userId,
      schemaName: schemaName,
      ipAddress: ip,
      userAgent: userAgent,
      deviceName: this.parseDevice(userAgent),
      isActive: true,
      expiresAt: new Date(Date.now() + this.sessionTTL * 1000),
    });
    return this.sessionRepo.save(session);
  }

  private toUserDtoRaw(user: any) {
    return {
      userId: user.id,
      email: user.email as any,
      displayName: user.display_name || user.displayName,
      roleId: user.role_id || user.roleId,
      roleName: user.role_name || (user as any).roleName,
      isActive: user.is_active !== undefined ? user.is_active : user.isActive,
      employeeId: user.employee_id || user.employeeId,
      avatarUrl: user.avatar_url || user.avatarUrl,
      lastLoginAt: user.last_login_at || user.lastLoginAt,
    };
  }

  private toUserDto(user: User) {
    return {
      userId: user.id,
      email: user.email as any,
      displayName: user.displayName as any,
      roleId: user.roleId,
      roleName: (user as any).roleName,
      isActive: user.isActive,
      employeeId: user.employeeId,
      avatarUrl: user.avatarUrl,
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

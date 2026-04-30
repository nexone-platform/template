import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../entities/admin-user.entity';
import { AuthLog } from '../entities/auth-log.entity';
import { SharedUser } from '../entities/shared-user.entity';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(AdminUser)
        private readonly userRepo: Repository<AdminUser>,

        @InjectRepository(AuthLog)
        private readonly logRepo: Repository<AuthLog>,

        @InjectRepository(SharedUser, 'shared')
        private readonly sharedUserRepo: Repository<SharedUser>,
    ) { }

    // ── Verify password against shared table (SHA256(password + salt_base64)) ──
    private verifySharedPassword(plainPassword: string, storedHash: string, salt: string): boolean {
        const hash = crypto.createHash('sha256')
            .update(plainPassword + salt)
            .digest('base64');
        return hash === storedHash;
    }

    // ── Seed default users if table is empty ──
    async seedDefaultUsers(): Promise<void> {
        const count = await this.userRepo.count();
        if (count === 0) {
            const defaults = [
                {
                    username: 'admin',
                    password: 'admin123',
                    displayName: 'Admin User',
                    email: 'admin@techbiz.co.th',
                    role: 'admin' as const,
                },
                {
                    username: 'editor',
                    password: 'editor123',
                    displayName: 'Editor User',
                    email: 'editor@techbiz.co.th',
                    role: 'editor' as const,
                },
            ];

            for (const u of defaults) {
                const hashedPassword = await bcrypt.hash(u.password, 10);
                const user = this.userRepo.create({ ...u, password: hashedPassword });
                await this.userRepo.save(user);
            }
            console.log('✅ Seeded default admin users (bcrypt hashed)');
        }
    }

    // ── Login ──
    async login(
        username: string,
        password: string,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<{ success: boolean; user?: any; message?: string }> {
        const usernameNorm = username.trim();

        // ── Step 1: Try shared table (postgres.public."auth-tb-ms-user") ──
        try {
            const sharedUser = await this.sharedUserRepo.findOne({
                where: { employeeId: usernameNorm },
            });

            if (sharedUser) {
                // Verify password with SHA256(password + salt_base64)
                const sharedPasswordOk = this.verifySharedPassword(
                    password,
                    sharedUser.password,
                    sharedUser.salt,
                );

                if (!sharedPasswordOk) {
                    await this.createLog({
                        userId: null,
                        username: usernameNorm,
                        action: 'login',
                        ipAddress,
                        userAgent,
                        success: false,
                        failReason: 'Wrong password (shared)',
                    });
                    return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
                }

                if (sharedUser.isActive === false) {
                    await this.createLog({
                        userId: null,
                        username: usernameNorm,
                        action: 'login',
                        ipAddress,
                        userAgent,
                        success: false,
                        failReason: 'Account disabled (shared)',
                    });
                    return { success: false, message: 'บัญชีนี้ถูกระงับ' };
                }

                // Shared auth OK → look up nex-site user for role/permissions
                const localUser = await this.userRepo.findOne({
                    where: { username: usernameNorm.toLowerCase() },
                });

                if (localUser) {
                    // Update lastLoginAt
                    localUser.lastLoginAt = new Date();
                    await this.userRepo.save(localUser);

                    await this.createLog({
                        userId: localUser.id,
                        username: localUser.username,
                        action: 'login',
                        ipAddress,
                        userAgent,
                        success: true,
                    });

                    return {
                        success: true,
                        user: {
                            id: localUser.id,
                            username: localUser.username,
                            displayName: localUser.displayName,
                            email: localUser.email || sharedUser.email,
                            role: localUser.role,
                            allowedPages: localUser.allowedPages || ['dashboard','pages','builder','theme','translations','analytics','settings'],
                        },
                    };
                }

                // Shared user exists but no local profile → create one automatically
                const hashedPw = await bcrypt.hash(password, 10);
                const newLocal = this.userRepo.create({
                    username: usernameNorm.toLowerCase(),
                    password: hashedPw,
                    displayName: sharedUser.employeeId,
                    email: sharedUser.email || '',
                    role: 'editor',
                    isActive: true,
                    allowedPages: ['dashboard','pages','builder','theme','translations','analytics','settings'],
                });
                const saved = await this.userRepo.save(newLocal);

                await this.createLog({
                    userId: saved.id,
                    username: saved.username,
                    action: 'login',
                    ipAddress,
                    userAgent,
                    success: true,
                });

                console.log(`✅ Auto-created local profile for shared user: ${usernameNorm}`);
                return {
                    success: true,
                    user: {
                        id: saved.id,
                        username: saved.username,
                        displayName: saved.displayName,
                        email: saved.email,
                        role: saved.role,
                        allowedPages: saved.allowedPages,
                    },
                };
            }
        } catch (err) {
            console.warn('⚠️ Shared auth lookup failed, falling back to local:', err.message);
        }

        // ── Step 2: Fallback to nex-site local auth ──
        const user = await this.userRepo.findOne({
            where: { username: usernameNorm.toLowerCase() },
        });

        if (!user) {
            await this.createLog({
                userId: null,
                username: usernameNorm.toLowerCase(),
                action: 'login',
                ipAddress,
                userAgent,
                success: false,
                failReason: 'User not found',
            });
            return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
        }

        if (!user.isActive) {
            await this.createLog({
                userId: user.id,
                username: user.username,
                action: 'login',
                ipAddress,
                userAgent,
                success: false,
                failReason: 'Account disabled',
            });
            return { success: false, message: 'บัญชีนี้ถูกระงับ' };
        }

        // Verify password (bcrypt hash or legacy plain-text fallback)
        const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        let passwordMatch = false;

        if (isBcryptHash) {
            passwordMatch = await bcrypt.compare(password, user.password);
        } else {
            passwordMatch = user.password === password;
            if (passwordMatch) {
                user.password = await bcrypt.hash(password, 10);
                await this.userRepo.save(user);
                console.log(`🔒 Auto-migrated password to bcrypt for user: ${user.username}`);
            }
        }

        if (!passwordMatch) {
            await this.createLog({
                userId: user.id,
                username: user.username,
                action: 'login',
                ipAddress,
                userAgent,
                success: false,
                failReason: 'Wrong password',
            });
            return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
        }

        // Success
        user.lastLoginAt = new Date();
        await this.userRepo.save(user);

        await this.createLog({
            userId: user.id,
            username: user.username,
            action: 'login',
            ipAddress,
            userAgent,
            success: true,
        });

        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
                role: user.role,
                allowedPages: user.allowedPages || ['dashboard','pages','builder','theme','translations','analytics','settings'],
            },
        };
    }

    // ── Logout ──
    async logout(
        userId: string,
        username: string,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<void> {
        await this.createLog({
            userId,
            username,
            action: 'logout',
            ipAddress,
            userAgent,
            success: true,
        });
    }

    // ── Auth Logs ──
    async getLogs(limit = 50): Promise<AuthLog[]> {
        return this.logRepo.find({
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    // ── All Users (nex-site) ──
    async getUsers(): Promise<Omit<AdminUser, 'password'>[]> {
        const users = await this.userRepo.find({ order: { createdAt: 'ASC' } });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return users.map(({ password: _pw, ...rest }) => rest);
    }

    // ── Shared Users (available to import) ──
    async getSharedUsers(): Promise<{ employeeId: string; email: string; isActive: boolean; alreadyImported: boolean }[]> {
        try {
            const sharedUsers = await this.sharedUserRepo.find({
                order: { employeeId: 'ASC' },
            });
            const localUsers = await this.userRepo.find();
            const localUsernames = new Set(localUsers.map(u => u.username.toLowerCase()));

            return sharedUsers
                .filter(su => su.employeeId && su.employeeId.trim() !== '')
                .map(su => ({
                    employeeId: su.employeeId,
                    email: su.email || '',
                    isActive: su.isActive !== false,
                    alreadyImported: localUsernames.has(su.employeeId.toLowerCase()),
                }));
        } catch (err) {
            console.warn('⚠️ Failed to fetch shared users:', err.message);
            return [];
        }
    }

    // ── Create User ──
    async createUser(data: {
        username: string;
        password?: string;
        displayName: string;
        email?: string;
        role?: 'admin' | 'editor';
        allowedPages?: string[];
    }): Promise<{ success: boolean; user?: any; message?: string }> {
        // Check duplicate username
        const existing = await this.userRepo.findOne({
            where: { username: data.username.toLowerCase() },
        });
        if (existing) {
            return { success: false, message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' };
        }

        // Password: use provided or generate a random placeholder (shared users auth via shared table)
        const finalPassword = data.password
            ? await bcrypt.hash(data.password, 10)
            : await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

        const user = this.userRepo.create({
            username: data.username.toLowerCase(),
            password: finalPassword,
            displayName: data.displayName,
            email: data.email || '',
            role: data.role || 'editor',
            allowedPages: data.allowedPages || ['dashboard','pages','builder','theme','translations','analytics','settings'],
        });
        const saved = await this.userRepo.save(user);

        return {
            success: true,
            user: {
                id: saved.id,
                username: saved.username,
                displayName: saved.displayName,
                email: saved.email,
                role: saved.role,
                isActive: saved.isActive,
                allowedPages: saved.allowedPages,
            },
            message: 'สร้างผู้ใช้สำเร็จ',
        };
    }

    // ── Update User ──
    async updateUser(
        id: string,
        data: {
            displayName?: string;
            email?: string;
            role?: 'admin' | 'editor';
            isActive?: boolean;
            password?: string;
            allowedPages?: string[];
        },
    ): Promise<{ success: boolean; user?: any; message?: string }> {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            return { success: false, message: 'ไม่พบผู้ใช้' };
        }

        if (data.displayName !== undefined) user.displayName = data.displayName;
        if (data.email !== undefined) user.email = data.email;
        if (data.role !== undefined) user.role = data.role;
        if (data.isActive !== undefined) user.isActive = data.isActive;
        if (data.password) user.password = await bcrypt.hash(data.password, 10);
        if (data.allowedPages !== undefined) user.allowedPages = data.allowedPages;

        await this.userRepo.save(user);

        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                allowedPages: user.allowedPages,
            },
            message: 'อัปเดตผู้ใช้สำเร็จ',
        };
    }

    // ── Delete User ──
    async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            return { success: false, message: 'ไม่พบผู้ใช้' };
        }

        await this.userRepo.remove(user);
        return { success: true, message: 'ลบผู้ใช้สำเร็จ' };
    }

    // ── Helper: create log entry ──
    private async createLog(data: {
        userId: string | null;
        username: string;
        action: 'login' | 'logout';
        ipAddress?: string;
        userAgent?: string;
        success: boolean;
        failReason?: string;
    }): Promise<void> {
        const log = this.logRepo.create({
            userId: data.userId ?? '00000000-0000-0000-0000-000000000000',
            username: data.username,
            action: data.action,
            ipAddress: data.ipAddress || null,
            userAgent: data.userAgent || null,
            success: data.success,
            failReason: data.failReason || null,
        });
        await this.logRepo.save(log);
    }
}

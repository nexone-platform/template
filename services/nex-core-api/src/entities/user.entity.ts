import { Entity, Column, PrimaryColumn, BeforeInsert, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';
import { Role } from './role.entity';
import { Employee } from './employee.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column({ length: 100 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ name: 'display_name', length: 100, nullable: true })
  displayName: string;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId: string | null;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'employee_id', type: 'uuid', nullable: true })
  employeeId: string | null;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'failed_login_count', default: 0 })
  failedLoginCount: number;

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil: Date | null;

  // --- ERP Standard Fields ---

  // Security & Authentication
  @Column({ name: 'require_password_change', default: false })
  requirePasswordChange: boolean;

  @Column({ name: 'password_changed_at', type: 'timestamptz', nullable: true })
  passwordChangedAt: Date | null;

  @Column({ name: 'mfa_enabled', default: false })
  mfaEnabled: boolean;

  @Column({ name: 'mfa_secret', length: 255, nullable: true })
  mfaSecret: string;



  // Lifecycle
  @Column({ name: 'valid_from', type: 'timestamptz', nullable: true })
  validFrom: Date | null;

  @Column({ name: 'valid_to', type: 'timestamptz', nullable: true })
  validTo: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  // Localization
  @Column({ name: 'timezone', length: 50, default: 'Asia/Bangkok' })
  timezone: string;

  @Column({ name: 'language', length: 10, default: 'TH' })
  language: string;
  // ---------------------------

  @CreateDateColumn({ name: 'create_date', type: 'timestamptz' })
  createDate: Date;

  @Column({ name: 'create_by', type: 'uuid', nullable: true })
  createBy: string | null;

  @UpdateDateColumn({ name: 'update_date', type: 'timestamptz' })
  updateDate: Date;

  @Column({ name: 'update_by', type: 'uuid', nullable: true })
  updateBy: string | null;
}

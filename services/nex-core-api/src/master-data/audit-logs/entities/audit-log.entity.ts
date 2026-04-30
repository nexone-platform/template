import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs', { schema: 'nex_core' })
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  // ── WHAT: ทำอะไร ──
  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, default: 'System', nullable: true })
  module: string;

  // ── WHO: ใครทำ ──
  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  user_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  role_name: string;

  // ── WHERE: ที่ไหน ──
  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent: string;

  // ── HOW: อย่างไร ──
  @Column({ type: 'jsonb', nullable: true })
  payload: any;

  @Column({ type: 'int', nullable: true })
  response_time_ms: number;

  // ── WHY: ผลลัพธ์ ──
  @Column({ type: 'varchar', length: 50, default: 'SUCCESS' })
  status: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  // ── WHEN: เมื่อไหร่ ──
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}

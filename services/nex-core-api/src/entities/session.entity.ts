import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'sessions' })
export class Session {
  @PrimaryColumn({ length: 128 })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'device_name', length: 100, nullable: true })
  deviceName: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'schema_name', length: 100, nullable: true })
  schemaName: string;

  @Column({ name: 'last_activity_at', type: 'timestamptz', default: () => 'now()' })
  lastActivityAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum NotificationType {
  BROADCAST = 'BROADCAST',
  INFO = 'INFO',
  ALERT = 'ALERT',
  SUCCESS = 'SUCCESS',
}

export enum NotificationStatus {
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

@Entity('notifications', { schema: 'nex_core' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // e.g. NOT-1004

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  target: string; // e.g. All Users, HR Department, Admin Team

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  read_rate: number; // e.g. 85.50 for 85.5%

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.SCHEDULED,
  })
  status: NotificationStatus;

  @Column({ type: 'timestamptz', nullable: true })
  scheduled_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  sent_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}

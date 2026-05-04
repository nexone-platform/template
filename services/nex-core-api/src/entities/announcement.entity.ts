import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('announcements', { schema: 'nex_core' })
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'message', type: 'text', nullable: true })
  message: string;

  @Column({ name: 'target_type', type: 'varchar', length: 50 })
  targetType: string;

  @Column({ name: 'target_ids', type: 'jsonb', nullable: true })
  targetIds: any;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'schedule_date', type: 'timestamptz', nullable: true })
  scheduleDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ name: 'create_by', type: 'varchar', length: 50, nullable: true })
  createBy: string;

  @CreateDateColumn({ name: 'create_date', type: 'timestamptz' })
  createDate: Date;

  @Column({ name: 'update_by', type: 'varchar', length: 50, nullable: true })
  updateBy: string;

  @UpdateDateColumn({ name: 'update_date', type: 'timestamptz' })
  updateDate: Date;
}

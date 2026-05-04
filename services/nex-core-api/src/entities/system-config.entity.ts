import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'system_config' })
export class SystemConfig {
  @PrimaryGeneratedColumn({ name: 'system_id', type: 'bigint' })
  systemId: number;

  @Column({ name: 'system_seq_no', type: 'int', default: 99 })
  systemSeqNo: number;

  @Column({ name: 'system_group', type: 'varchar', length: 50, nullable: true })
  systemGroup: string;

  @Column({ name: 'system_key', type: 'varchar', length: 100 })
  systemKey: string;

  @Column({ name: 'system_value', type: 'varchar', length: 100, nullable: true })
  systemValue: string;

  @Column({ name: 'system_type', type: 'varchar', length: 100 })
  systemType: string;

  @Column({ name: 'description', type: 'varchar', length: 200 })
  description: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'create_date', type: 'timestamptz' })
  createDate: Date;

  @Column({ name: 'create_by', type: 'varchar', length: 50, default: 'system' })
  createBy: string;

  @UpdateDateColumn({ name: 'update_date', nullable: true, type: 'timestamptz' })
  updateDate: Date;

  @Column({ name: 'update_by', type: 'varchar', length: 50, nullable: true })
  updateBy: string;
}

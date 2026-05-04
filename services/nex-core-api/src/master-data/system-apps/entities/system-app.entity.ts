import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_apps')
export class SystemApp {
  @PrimaryGeneratedColumn({ name: 'app_id' })
  id: number;

  @Column({ name: 'app_name', length: 100 })
  app_name: string;

  @Column({ name: 'icon_path', length: 200, nullable: true })
  icon_path: string;


  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'app_seq_no', default: 99 })
  seq_no: number;

  @Column({ name: 'app_group', length: 50, nullable: true })
  app_group: string;

  @Column({ name: 'route_path', length: 500, nullable: true })
  route_path: string;

  @Column({ name: 'api_path', length: 500, nullable: true })
  api_path: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'create_by' })
  create_by: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'update_by' })
  update_by: string;

  @CreateDateColumn({ name: 'create_date', type: 'timestamptz' })
  create_date: Date;

  @UpdateDateColumn({ name: 'update_date', type: 'timestamptz', nullable: true })
  update_date: Date;
}

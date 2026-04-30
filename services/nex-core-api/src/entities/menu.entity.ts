import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('menus', { schema: 'nex_core' })
export class Menu {
  @PrimaryGeneratedColumn({ name: 'menus_id' })
  menus_id: number;

  @Column({ name: 'menu_code', nullable: true })
  menu_code: string;

  @Column({ nullable: true })
  title: string;

  @Column({ name: 'menu_value', nullable: true })
  menu_value: string;

  @Column({ nullable: true })
  route: string;

  @Column({ name: 'page_key', nullable: true })
  page_key: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ nullable: true })
  icon: string;

  @Column({ name: 'parent_id', nullable: true })
  parent_id: string;

  @Column({ name: 'menu_seq', nullable: true })
  menu_seq: number;

  @Column({ name: 'app_name', nullable: true })
  app_name: string;

  @CreateDateColumn({ name: 'create_date' })
  create_date: Date;

  @Column({ name: 'create_by', nullable: true })
  create_by: string;

  @UpdateDateColumn({ name: 'update_date' })
  update_date: Date;

  @Column({ name: 'update_by', nullable: true })
  update_by: string;
}

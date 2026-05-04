import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('menus', { schema: 'nex_core' })
export class Menu {
  @PrimaryGeneratedColumn()
  menu_id: number;

  @Column({ name: 'menu_code', nullable: true })
  menu_code: string;

  @Column({ nullable: true })
  title: string;

  @Column({ name: 'menu_value', nullable: true })
  menu_value: string;

  @Column({ nullable: true })
  base: string;

  @Column({ nullable: true })
  route: string;

  @Column({ name: 'page_key', nullable: true })
  page_key: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  parent_id: number;

  @Column({ nullable: true })
  menu_seq: number;

  @Column({ nullable: true })
  app_name: string;

  @CreateDateColumn()
  create_date: Date;

  @Column({ nullable: true })
  create_by: string;

  @UpdateDateColumn()
  update_date: Date;

  @Column({ nullable: true })
  update_by: string;
}

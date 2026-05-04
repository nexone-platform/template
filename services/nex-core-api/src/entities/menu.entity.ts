import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Entity('menus', { schema: 'nex_core' })
export class Menu {
  @PrimaryColumn('uuid', { name: 'menu_id' })
  menu_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.menu_id) {
      this.menu_id = uuidv7();
    }
  }

  @Column({ name: 'menu_code', nullable: true })
  menu_code: string;

  @Column({ nullable: true })
  title: string;



  @Column({ nullable: true })
  route: string;

  @Column({ name: 'menu_type', nullable: true, default: 'menu' })
  menu_type: string;

  @Column({ name: 'page_key', nullable: true })
  page_key: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ nullable: true })
  icon: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parent_id: string;



  @Column({ name: 'menu_seq', nullable: true })
  menu_seq: number;

  @Column({ name: 'app_name', nullable: true })
  app_name: string;

  @CreateDateColumn({ name: 'create_date', type: 'timestamptz', nullable: true })
  create_date: Date;

  @Column({ name: 'create_by', type: 'uuid', nullable: true })
  create_by: string;

  @UpdateDateColumn({ name: 'update_date', type: 'timestamptz', nullable: true })
  update_date: Date;

  @Column({ name: 'update_by', type: 'uuid', nullable: true })
  update_by: string;
}

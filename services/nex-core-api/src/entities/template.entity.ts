import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('templates', { schema: 'nex_core' })

export class Template {
  @PrimaryGeneratedColumn({ name: 'template_id' })
  template_id: number;

  @Column({ name: 'template_group', nullable: true })
  template_group: string;

  @Column({ name: 'template_name', nullable: true })
  template_name: string;

  @Column({ name: 'template_desc', nullable: true })
  template_desc: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'create_date', default: () => 'now()', type: 'timestamptz', nullable: true })
  create_date: Date;

  @Column({ name: 'create_by', default: 'system', nullable: true })
  create_by: string;

  @UpdateDateColumn({ name: 'update_date', nullable: true, type: 'timestamptz' })
  update_date: Date;

  @Column({ name: 'update_by', nullable: true })
  update_by: string;
}

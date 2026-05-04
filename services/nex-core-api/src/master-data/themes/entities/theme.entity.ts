import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ schema: 'nex_core', name: 'themes' })
export class Theme {
  @PrimaryGeneratedColumn({ name: 'theme_id' })
  theme_id: number;

  @Column({ name: 'primary_color', length: 20, nullable: true })
  primary_color: string;



  @Column({ name: 'accent_color', length: 20, nullable: true })
  accent_color: string;



  @Column({ name: 'success_color', length: 20, nullable: true })
  success_color: string;

  @Column({ name: 'danger_color', length: 20, nullable: true })
  danger_color: string;

  @Column({ name: 'warning_color', length: 20, nullable: true })
  warning_color: string;

  @Column({ name: 'bg_color', length: 20, nullable: true })
  bg_color: string;

  @Column({ name: 'card_color', length: 20, nullable: true })
  card_color: string;  @Column({ name: 'sidebar_color', length: 20, nullable: true })
  sidebar_color: string;

  @Column({ name: 'sidebar_hover', length: 20, nullable: true })
  sidebar_hover: string;



  @Column({ name: 'header_color', length: 30, nullable: true })
  header_color: string;

  @Column({ name: 'header_text_color', length: 20, nullable: true })
  header_text_color: string;



  @Column({ name: 'text_secondary', length: 20, nullable: true })
  text_secondary: string;

  @Column({ name: 'text_primary', length: 20, nullable: true })
  text_primary: string;

  @Column({ name: 'text_muted', length: 20, nullable: true })
  text_muted: string;  @Column({ name: 'border_color', length: 20, nullable: true })
  border_color: string;



  @Column({ name: 'font_family', length: 100, nullable: true })
  font_family: string;

  @Column({ name: 'font_size_base', length: 10, nullable: true })
  font_size_base: string;



  @Column({ name: 'header_font_size', length: 10, nullable: true })
  header_font_size: string;

  @Column({ name: 'header_font_family', length: 100, nullable: true })
  header_font_family: string;

  @Column({ name: 'sidebar_width', length: 10, nullable: true })
  sidebar_width: string;



  @Column({ name: 'header_height', length: 10, nullable: true })
  header_height: string;

  @Column({ name: 'border_radius', length: 10, nullable: true })
  border_radius: string;  @Column({ name: 'dark_mode_enabled', default: false })
  dark_mode_enabled: boolean;



  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'create_date', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  create_date: Date;

  @Column({ name: 'create_by', length: 50, default: 'system' })
  create_by: string;

  @Column({ name: 'update_date', type: 'timestamptz', nullable: true })
  update_date: Date;

  @Column({ name: 'compact_mode', default: false })
  compact_mode: boolean;
  @Column({ name: 'update_by', length: 50, nullable: true })
  update_by: string;
}

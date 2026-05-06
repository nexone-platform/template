import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('template_checkbox', { schema: 'nex_core' })
export class TemplateCheckbox {
  @PrimaryColumn({ name: 'id', length: 50 })
  id: string;

  @Column({ name: 'customer_name', length: 255 })
  customer_name: string;

  @Column({ name: 'origin', length: 255 })
  origin: string;

  @Column({ name: 'destination', length: 255 })
  destination: string;

  @Column({ name: 'cargo_type', length: 100, nullable: true })
  cargo_type: string;

  @Column({ name: 'weight', type: 'numeric', precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column({ name: 'status', length: 50, default: 'pending' })
  status: string;

  @Column({ name: 'priority', length: 50, default: 'normal' })
  priority: string;

  @Column({ name: 'delivery_date', type: 'date', nullable: true })
  delivery_date: string;

  @Column({ name: 'estimated_cost', type: 'numeric', precision: 12, scale: 2, nullable: true })
  estimated_cost: number;

  @Column({ name: 'vehicle_id', length: 50, nullable: true })
  vehicle_id: string;

  @Column({ name: 'driver_id', length: 50, nullable: true })
  driver_id: string;

  @CreateDateColumn({ name: 'create_date', type: 'timestamptz', default: () => 'now()' })
  create_date: Date;

  @Column({ name: 'create_by', length: 50, default: 'system' })
  create_by: string;

  @UpdateDateColumn({ name: 'update_date', type: 'timestamptz', nullable: true })
  update_date: Date;

  @Column({ name: 'update_by', length: 50, nullable: true })
  update_by: string;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'template_master_graph', schema: 'nex_core' })
export class TemplateMasterGraph {
  @PrimaryGeneratedColumn({ name: 'template_id' })
  id: number;

  @Column({ name: 'invoice_no', length: 50, unique: true })
  invoice: string;

  @Column({ name: 'customer', length: 255 })
  customer: string;

  @Column({ name: 'amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'status', length: 20, default: 'รอชำระ' })
  status: string;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate: string;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ name: 'order_id', length: 50, nullable: true })
  orderId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'create_date', type: 'timestamptz' })
  createDate: Date;

  @Column({ name: 'create_by', length: 50, nullable: true })
  createBy: string;

  @UpdateDateColumn({ name: 'update_date', type: 'timestamptz' })
  updateDate: Date;

  @Column({ name: 'update_by', length: 50, nullable: true })
  updateBy: string;
}

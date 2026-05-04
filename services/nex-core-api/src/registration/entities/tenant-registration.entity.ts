import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tenant_registrations' })
export class TenantRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_title', length: 100, nullable: true })
  companyTitle: string;

  @Column({ name: 'company_name_th', length: 255 })
  companyNameTH: string;

  @Column({ name: 'company_name_en', length: 255, nullable: true })
  companyNameEN: string;

  @Column({ name: 'company_abbreviation', length: 50, nullable: true })
  companyAbbreviation: string;

  @Column({ name: 'tax_id', length: 20, nullable: true })
  taxId: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255 })
  email: string;

  @Column({ name: 'employee_range', length: 20, nullable: true })
  employeeRange: string;

  @Column({ name: 'business_group', length: 3 })
  businessGroup: string;

  @Column({ name: 'business_sub_type', type: 'integer' })
  businessSubType: number;

  @Column({ name: 'admin_name', length: 255 })
  adminName: string;

  @Column({ name: 'admin_email', length: 255 })
  adminEmail: string;

  @Column({ name: 'admin_phone', length: 20, nullable: true })
  adminPhone: string;

  @Column({ name: 'admin_password_hash', length: 512, nullable: true })
  adminPasswordHash: string;

  @Column({ name: 'schema_name', length: 100, nullable: true })
  schemaName: string;

  @Column({
    name: 'provisioning_status',
    length: 20,
    default: 'pending',
  })
  provisioningStatus: string;

  @Column({ name: 'enabled_apps', type: 'jsonb', nullable: true })
  enabledApps: string[];

  @Column({ name: 'default_roles', type: 'jsonb', nullable: true })
  defaultRoles: string[];

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}

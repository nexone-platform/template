import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BusinessType } from './business-type.entity';

@Entity({ name: 'business_sub_types' })
export class BusinessSubType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'business_type_code', length: 3 })
  businessTypeCode: string;

  @Column({ name: 'sub_type_number', type: 'integer' })
  subTypeNumber: number;

  @Column({ name: 'name_th', length: 200 })
  nameTH: string;

  @Column({ name: 'name_en', length: 200 })
  nameEN: string;

  @Column({ name: 'description_th', type: 'text', nullable: true })
  descriptionTH: string;

  @Column({ name: 'examples_th', type: 'text', nullable: true })
  examplesTH: string;

  @Column({ name: 'default_roles', type: 'jsonb', nullable: true })
  defaultRoles: string[];

  @Column({ name: 'default_apps', type: 'jsonb', nullable: true })
  defaultApps: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => BusinessType, (bt) => bt.subTypes)
  @JoinColumn({ name: 'business_type_code', referencedColumnName: 'code' })
  businessType: BusinessType;
}

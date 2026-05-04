import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BusinessSubType } from './business-sub-type.entity';

@Entity({ name: 'business_types' })
export class BusinessType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 3, unique: true })
  code: string;

  @Column({ name: 'name_th', length: 100 })
  nameTH: string;

  @Column({ name: 'name_en', length: 100 })
  nameEN: string;

  @Column({ length: 10, nullable: true })
  icon: string;

  @Column({ name: 'description_th', type: 'text', nullable: true })
  descriptionTH: string;

  @Column({ name: 'color', length: 7, nullable: true })
  color: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => BusinessSubType, (sub) => sub.businessType)
  subTypes: BusinessSubType[];
}

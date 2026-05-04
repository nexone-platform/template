import { Entity, Column, PrimaryColumn, BeforeInsert, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Entity({ name: 'employees', schema: 'nex_core' })
export class Employee {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv7();
    }
  }

  @Column({ name: 'employee_code', length: 50, nullable: true })
  employeeCode: string;

  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName: string;

  @Column({ name: 'manager_id', type: 'uuid', nullable: true })
  managerId: string;

  @Column({ name: 'company_id', type: 'uuid', nullable: true })
  companyId: string;

  @Column({ name: 'cost_center_code', length: 50, nullable: true })
  costCenterCode: string;

  @CreateDateColumn({ name: 'create_date', type: 'timestamptz' })
  createDate: Date;

  @Column({ name: 'create_by', type: 'uuid', nullable: true })
  createBy: string;

  @UpdateDateColumn({ name: 'update_date', type: 'timestamptz' })
  updateDate: Date;

  @Column({ name: 'update_by', type: 'uuid', nullable: true })
  updateBy: string;
}

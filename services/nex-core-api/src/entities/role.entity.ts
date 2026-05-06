import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Entity({ name: 'roles', schema: 'nex_core' })
export class Role {
  @PrimaryColumn('uuid', { name: 'role_id' })
  roleId: string;

  @BeforeInsert()
  generateId() {
    if (!this.roleId) {
      this.roleId = uuidv7();
    }
  }

  @Column({ name: 'role_name', length: 255, nullable: true })
  roleName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;


  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'create_date', type: 'timestamptz', nullable: true })
  createDate: Date;

  @Column({ name: 'create_by', type: 'uuid', nullable: true })
  createBy: string | null;

  @UpdateDateColumn({ name: 'update_date', type: 'timestamptz', nullable: true })
  updateDate: Date;

  @Column({ name: 'update_by', type: 'uuid', nullable: true })
  updateBy: string | null;
}

import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Entity('role_permissions', { schema: 'nex_core' })
export class RolePermission {
  @PrimaryColumn('uuid', { name: 'permission_id' })
  permissionId: string;

  @BeforeInsert()
  generateId() {
    if (!this.permissionId) {
      this.permissionId = uuidv7();
    }
  }

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ name: 'menu_id', type: 'uuid', nullable: true })
  menuId: string;

  @Column({ name: 'app_name', nullable: true })
  appName: string;

  @Column({ name: 'can_view', default: false })
  canView: boolean;

  @Column({ name: 'can_add', default: false })
  canAdd: boolean;

  @Column({ name: 'can_edit', default: false })
  canEdit: boolean;

  @Column({ name: 'can_delete', default: false })
  canDelete: boolean;

  @Column({ name: 'can_import', default: false })
  canImport: boolean;

  @Column({ name: 'can_export', default: false })
  canExport: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'create_date', type: 'timestamptz', nullable: true })
  createDate: Date;

  @Column({ name: 'create_by', type: 'uuid', nullable: true })
  createBy: string;

  @UpdateDateColumn({ name: 'update_date', type: 'timestamptz', nullable: true })
  updateDate: Date;

  @Column({ name: 'update_by', type: 'uuid', nullable: true })
  updateBy: string;
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('role_permissions', { schema: 'nex_core' })
export class RolePermission {
  @PrimaryGeneratedColumn({ name: 'permission_id' })
  permissionId: number;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'menu_id' })
  menuId: number;

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

  @CreateDateColumn({ name: 'create_date' })
  createDate: Date;

  @Column({ name: 'create_by', nullable: true })
  createBy: string;

  @UpdateDateColumn({ name: 'update_date' })
  updateDate: Date;

  @Column({ name: 'update_by', nullable: true })
  updateBy: string;
}

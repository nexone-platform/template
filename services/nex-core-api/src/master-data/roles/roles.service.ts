// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { RolePermission } from '../../entities/role-permission.entity';
import { Menu } from '../../entities/menu.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly permRepo: Repository<RolePermission>,
    @InjectRepository(Menu)
    private readonly menuRepo: Repository<Menu>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.rolesRepo.find({
      order: { roleId: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepo.findOne({ where: { roleId: id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async create(createDto: Partial<Role>): Promise<Role> {
    const role = this.rolesRepo.create({
      roleName: createDto.roleName,
      description: createDto.description,
      isActive: createDto.isActive ?? true,
      createBy: null,
    });
    return this.rolesRepo.save(role);
  }

  async update(id: string, updateDto: Partial<Role>): Promise<Role> {
    const role = await this.findOne(id);
    if (updateDto.roleName !== undefined) role.roleName = updateDto.roleName;
    if (updateDto.description !== undefined) role.description = updateDto.description;
    if (updateDto.isActive !== undefined) role.isActive = updateDto.isActive;
    role.updateBy = null;
    return this.rolesRepo.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepo.remove(role);
  }

  /**
   * Get menus tree for a given app, with each menu's permission for a specific role
   */
  async getMenusWithPermissions(roleId: string, appName: string): Promise<any[]> {
    // Fetch all menus for the app ordered by parent then seq
    const menus = await this.menuRepo.find({
      where: { app_name: appName, is_active: true },
      order: { menu_seq: 'ASC' },
    });

    // Fetch existing permissions for this role+app
    const perms = await this.permRepo.find({
      where: { roleId, appName },
    });

    // Build a lookup map: menuId -> permission
    const permMap: Record<string, RolePermission> = {};
    perms.forEach(p => { permMap[p.menuId] = p; });

    // Attach permissions to each menu
    const menuWithPerms = menus.map(m => {
      const perm = permMap[m.menu_id];
      return {
        menuId: m.menu_id,
        parentId: m.parent_id || null,
        title: m.title,
        menuCode: m.menu_code,
        menuSeq: m.menu_seq,
        icon: m.icon,
        canView: perm?.canView ?? false,
        canAdd: perm?.canAdd ?? false,
        canEdit: perm?.canEdit ?? false,
        canDelete: perm?.canDelete ?? false,
        canImport: perm?.canImport ?? false,
        canExport: perm?.canExport ?? false,
        isActive: perm?.isActive ?? false,   // default OFF when no record exists
        permissionId: perm?.permissionId ?? null,
      };
    });

    // Build tree structure
    const rootMenus: any[] = [];
    const menuMap: Record<string, any> = {};
    menuWithPerms.forEach(m => { menuMap[m.menuId] = { ...m, children: [] }; });
    menuWithPerms.forEach(m => {
      if (m.parentId === null) {
        rootMenus.push(menuMap[m.menuId]);
      } else if (menuMap[m.parentId]) {
        menuMap[m.parentId].children.push(menuMap[m.menuId]);
      } else {
        // Parent not in this app scope — treat as root
        rootMenus.push(menuMap[m.menuId]);
      }
    });

    return rootMenus;
  }

  /**
   * Upsert permissions for a role (bulk save)
   */
  async savePermissions(
    roleId: string,
    appName: string,
    permissions: Array<{
      menuId: string;
      permissionId?: string | null;
      isActive: boolean;
      canView: boolean;
      canAdd: boolean;
      canEdit: boolean;
      canDelete: boolean;
      canImport: boolean;
      canExport: boolean;
    }>,
  ): Promise<void> {
    for (const p of permissions) {
      if (p.permissionId) {
        // Update existing
        await this.permRepo.update(p.permissionId, {
          isActive: p.isActive,
          canView: p.canView,
          canAdd: p.canAdd,
          canEdit: p.canEdit,
          canDelete: p.canDelete,
          canImport: p.canImport,
          canExport: p.canExport,
          updateBy: null,
        });
      } else {
        // Insert new only if has any permission or is being activated
        if (p.isActive || p.canView || p.canAdd || p.canEdit || p.canDelete || p.canImport || p.canExport) {
          const perm = this.permRepo.create({
            roleId,
            menuId: p.menuId,
            appName,
            isActive: p.isActive,
            canView: p.canView,
            canAdd: p.canAdd,
            canEdit: p.canEdit,
            canDelete: p.canDelete,
            canImport: p.canImport,
            canExport: p.canExport,
            createBy: null,
          });
          await this.permRepo.save(perm);
        }
      }
    }
  }
}

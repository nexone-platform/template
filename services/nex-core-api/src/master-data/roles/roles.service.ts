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
      order: { roleName: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepo.findOne({ where: { roleId: id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async create(createDto: Partial<Role>, userId?: string): Promise<Role> {
    const role = this.rolesRepo.create({
      roleName: createDto.roleName,
      description: createDto.description,
      isActive: createDto.isActive ?? true,
      createBy: userId || null,
      updateBy: userId || null,
    });
    return this.rolesRepo.save(role);
  }

  async update(id: string, updateDto: Partial<Role>, userId?: string): Promise<Role> {
    const role = await this.findOne(id);
    if (updateDto.roleName !== undefined) role.roleName = updateDto.roleName;
    if (updateDto.description !== undefined) role.description = updateDto.description;
    if (updateDto.isActive !== undefined) role.isActive = updateDto.isActive;
    role.updateBy = userId || null;
    return this.rolesRepo.save(role);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const role = await this.findOne(id);
    await this.rolesRepo.remove(role);
    return { success: true };
  }

  /**
   * Get menus tree for a given app, with each menu's permission for a specific role
   */
  async getMenusWithPermissions(roleId: string, appName: string): Promise<any[]> {
    // Fetch all menus for the app ordered by parent then seq (case-insensitive match)
    const menus = await this.menuRepo
      .createQueryBuilder('m')
      .where('LOWER(m.app_name) = LOWER(:appName)', { appName })
      .andWhere('m.is_active = true')
      .orderBy('m.menu_seq', 'ASC')
      .getMany();

    // Fetch existing permissions for this role+app (case-insensitive)
    const perms = await this.permRepo
      .createQueryBuilder('p')
      .where('p.role_id = :roleId', { roleId })
      .andWhere('LOWER(p.app_name) = LOWER(:appName)', { appName })
      .getMany();

    // Build a lookup map: menuId -> permission
    const permMap: Record<string, RolePermission> = {};
    perms.forEach(p => { permMap[p.menuId] = p; });

    // Attach permissions to each menu
    // ถ้ายังไม่มี RolePermission record → default เป็น allow ทั้งหมด
    // ถ้ามี record แล้ว → ใช้ค่าที่บันทึกไว้จริง
    const menuWithPerms = menus.map(m => {
      const perm = permMap[m.menu_id];
      const hasPermRecord = !!perm;
      return {
        menuId: m.menu_id,
        parentId: m.parent_id || null,
        title: m.title,
        menuCode: m.menu_code,
        menuSeq: m.menu_seq,
        icon: m.icon,
        canView: hasPermRecord ? (perm.canView ?? false) : false,
        canAdd: hasPermRecord ? (perm.canAdd ?? false) : false,
        canEdit: hasPermRecord ? (perm.canEdit ?? false) : false,
        canDelete: hasPermRecord ? (perm.canDelete ?? false) : false,
        canImport: hasPermRecord ? (perm.canImport ?? false) : false,
        canExport: hasPermRecord ? (perm.canExport ?? false) : false,
        isActive: hasPermRecord ? (perm.isActive ?? false) : false,
        permissionId: perm?.permissionId ?? null,
        menuType: m.menu_type || 'menu', // Explicit mapping with fallback
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
        rootMenus.push(menuMap[m.menuId]);
      }
    });

    return rootMenus;
  }

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
    userId?: string,
  ): Promise<{ success: boolean }> {
    try {
      console.log(`[RolesService] Saving permissions for role: ${roleId}, app: ${appName}, by user: ${userId}`);
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
            updateBy: userId || null,
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
              createBy: userId || null,
              updateBy: userId || null,
            });
            await this.permRepo.save(perm);
          }
        }
      }
      return { success: true };
    } catch (error) {
      console.error('[RolesService] Error in savePermissions:', error);
      throw error;
    }
  }
}

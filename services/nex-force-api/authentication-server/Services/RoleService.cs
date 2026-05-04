using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using System.Data;
using System.Security;
using static authentication_server.Services.MenuService;

namespace authentication_server.Services
{
    public class RoleService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;

        public RoleService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;

        }
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public class RoleDto
        {
            public int RoleId { get; set; }
            public string RoleName { get; set; }
            public string Username { get; set; }
            public int? DepartmentId { get; set; }
        }
        public async Task<string> UpsertRoleAsync(RoleDto roleDto)
        {

            if (roleDto.RoleId > 0)
            {
                // Update existing role
                var role = await _context.Roles
                    .Where(e => e.RoleId == roleDto.RoleId)
                    .FirstOrDefaultAsync();
                if (role == null)
                {
                    throw new Exception("Role not found.");
                }

                role.RoleName = roleDto.RoleName;
                role.UpdateDate = DateTime.UtcNow;
                role.UpdateBy = roleDto.Username;
                role.CreateDate = role.CreateDate.ToUniversalTime();
                role.DepartmentId = roleDto.DepartmentId;

                _context.Roles.Update(role);
            }
            else
            {
                int newRoleId = (await _context.Roles.MaxAsync(r => (int?)r.RoleId) ?? 0) + 1;
                // Create new role
                var role = new Role
                {
                    RoleId = newRoleId,
                    RoleName = roleDto.RoleName,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = roleDto.Username,
                    UpdateDate = DateTime.UtcNow,
                    UpdateBy = roleDto.Username,
                    DepartmentId = roleDto.DepartmentId,
                };

                await _context.Roles.AddAsync(role);

                // ดึงเมนูทั้งหมดจากฐานข้อมูล
                var menus = await _context.Menus.Where(m => m.IsActive).ToListAsync();
                var rolePermissions = menus.Select(menu => new RolePermission
                {
                    RoleId = role.RoleId,
                    MenuId = (int)menu.MenuId,
                    CanView = true,   // ให้สิทธิ์ Read เป็นค่า Default
                    CanEdit = true, // อื่น ๆ สามารถตั้งค่าได้ตามต้องการ
                    CanAdd = true,
                    CanDelete = true,
                    CanImport = true,
                    CanExport = true,
                    IsActive = true,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = roleDto.Username
                }).ToList();

                await _context.RolePermissions.AddRangeAsync(rolePermissions);
            }

            await _context.SaveChangesAsync();
            return "Role save successfully";
        }

        public async Task<bool> CreateOrUpdateRolePermissionsAsync(RolePermissionDTO model)
        {
            if (model == null || model.RoleId == 0 || model.Permissions == null)
            {
                return false;
            }

            foreach (var permission in model.Permissions)
            {
                var existingPermission = await _context.RolePermissions
                    .FirstOrDefaultAsync(rp => rp.RoleId == model.RoleId && rp.MenuId == permission.MenuId);

                if (existingPermission != null)
                {
                    // Update existing permission
                    existingPermission.CanView = permission.CanView;
                    existingPermission.CanEdit = permission.CanEdit;
                    existingPermission.CanAdd = permission.CanAdd;
                    existingPermission.CanDelete = permission.CanDelete;
                    existingPermission.CanImport = permission.CanImport;
                    existingPermission.CanExport = permission.CanExport;
                    existingPermission.IsActive = permission.IsActive;
                    existingPermission.UpdateDate = DateTime.UtcNow;
                    existingPermission.UpdateBy = model.Username;
                    existingPermission.CreateDate = existingPermission.CreateDate = existingPermission.CreateDate.HasValue
                    ? (existingPermission.CreateDate.Value == null ? (DateTime?)null : existingPermission.CreateDate.Value.ToUniversalTime())
                    : (DateTime?)null;

                    _context.RolePermissions.Update(existingPermission);
                }
                else
                {
                    // Insert new permission
                    _context.RolePermissions.Add(new RolePermission
                    {
                        RoleId = model.RoleId,
                        MenuId = (int)permission.MenuId,
                        CanView = permission.CanView,
                        CanEdit = permission.CanEdit,
                        CanAdd = permission.CanAdd,
                        CanDelete = permission.CanDelete,
                        CanImport = permission.CanImport,
                        CanExport = permission.CanExport,
                        IsActive = permission.IsActive,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = model.Username
                    });

                   
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public class PermissionDto
        {
            public int PermissionId { get; set; }
            public long MenuId { get; set; } // ID ของเมนู
            public decimal RoleId { get; set; } // ID ของเมนู
            public string? MenuCode { get; set; } // ID ของเมนู
            public string Title { get; set; } // ชื่อของเมนู
            public string Route { get; set; } // ชื่อของเมนู
            public int? ParentId { get; set; } // ID ของเมนูแม่ (หากมี)
            public bool CanView { get; set; } // สิทธิ์ในการอ่าน
            public bool CanEdit { get; set; } // สิทธิ์ในการเขียน
            public bool CanAdd { get; set; } // สิทธิ์ในการสร้าง
            public bool CanDelete { get; set; } // สิทธิ์ในการลบ
            public bool CanImport { get; set; } // สิทธิ์ในการนำเข้า
            public bool CanExport { get; set; } // สิทธิ์ในการส่งออก
            public bool IsActive { get; set; } // สถานะการใช้งาน (Active/Inactive)
            public List<PermissionDto>? SubMenus { get; set; } = new List<PermissionDto>();
        }

        public async Task<List<PermissionDto>> GetPermissions(int roleId)
        {
            var menuPermissions = await (from menu in _context.Menus
                                         join rp in _context.RolePermissions
                                         on menu.MenuId equals rp.MenuId into rolePermissionsGroup
                                         from rp in rolePermissionsGroup.DefaultIfEmpty() // Left Join
                                         where menu.IsActive  && rp.RoleId == roleId
                                         select new PermissionDto
                                         {
                                             MenuId = menu.MenuId,
                                             Title = menu.Title,
                                             ParentId = menu.ParentId,
                                             RoleId = roleId,
                                             Route = menu.Route,
                                             MenuCode = menu.MenuCode,
                                             CanView = rp != null && rp.RoleId == roleId ? rp.CanView : false,
                                             CanEdit = rp != null && rp.RoleId == roleId ? rp.CanEdit : false,
                                             CanAdd = rp != null && rp.RoleId == roleId ? rp.CanAdd : false,
                                             CanDelete = rp != null && rp.RoleId == roleId ? rp.CanDelete : false,
                                             CanImport = rp != null && rp.RoleId == roleId ? rp.CanImport : false,
                                             CanExport = rp != null && rp.RoleId == roleId ? rp.CanExport : false,
                                             IsActive = rp != null && rp.RoleId == roleId ? rp.IsActive : false
                                         })
                                          .OrderBy(m => m.ParentId)
                                          .ThenBy(m => m.MenuCode)
                                          .ToListAsync();

            return menuPermissions;
        }
        public async Task<List<PermissionDto>> GetPermissionsData(int roleId)
        {
            var menuPermissions = await (from menu in _context.Menus
                                         join rp in _context.RolePermissions
                                         on menu.MenuId equals rp.MenuId into rolePermissionsGroup
                                         from rp in rolePermissionsGroup.DefaultIfEmpty() // Left join
                                         where menu.IsActive && rp.RoleId == roleId
                                         select new PermissionDto
                                         {
                                             PermissionId = rp.PermissionId,
                                             MenuId = menu.MenuId,
                                             Title = menu.Title,
                                             ParentId = menu.ParentId,
                                             RoleId = roleId,
                                             Route = menu.Route,
                                             MenuCode = menu.MenuCode,
                                             CanView = rp != null && rp.RoleId == roleId ? rp.CanView : false,
                                             CanEdit = rp != null && rp.RoleId == roleId ? rp.CanEdit : false,
                                             CanAdd = rp != null && rp.RoleId == roleId ? rp.CanAdd : false,
                                             CanDelete = rp != null && rp.RoleId == roleId ? rp.CanDelete : false,
                                             CanImport = rp != null && rp.RoleId == roleId ? rp.CanImport : false,
                                             CanExport = rp != null && rp.RoleId == roleId ? rp.CanExport : false,
                                             IsActive = rp != null && rp.RoleId == roleId ? rp.IsActive : false,
                                             SubMenus = new List<PermissionDto>() // Initialize the list
                                         })
                                         .OrderBy(m => m.ParentId)
                                         .ThenBy(m => m.MenuCode)
                                         .ToListAsync();

            // Build the tree with two layers
            var rootMenus = menuPermissions.Where(m => m.ParentId == null).ToList();

            foreach (var root in rootMenus)
            {
                // First layer: Find submenus where ParentId equals the root menu's MenusId.
                root.SubMenus = menuPermissions.Where(m => m.ParentId == root.MenuId).ToList();

                foreach (var firstLayer in root.SubMenus)
                {
                    // Second layer: For each first-layer submenu, find its submenus.
                    firstLayer.SubMenus = menuPermissions.Where(m => m.ParentId == firstLayer.MenuId).ToList();
                }
            }

            return rootMenus;
        }

        public class PermissionDetailDto
        {
            public bool CanView { get; set; }
            public bool CanEdit { get; set; }
            public bool CanAdd { get; set; }
            public bool CanDelete { get; set; }
            public bool CanImport { get; set; }
            public bool CanExport { get; set; }
            public bool IsActive { get; set; }
        }



        public class RolePermissionDTO
        {
            public int RoleId { get; set; }
            public List<PermissionDTO> Permissions { get; set; } = new List<PermissionDTO>();
            public string? Username { get; set; }
        }

        public class PermissionDTO
        {
            public int? PermissionId { get; set; } // Nullable for updating
            public long MenuId { get; set; }
            public bool CanView { get; set; }
            public bool CanEdit { get; set; }
            public bool CanAdd { get; set; }
            public bool CanDelete { get; set; }
            public bool CanImport { get; set; }
            public bool CanExport { get; set; }
            public bool IsActive { get; set; }
        }

        public class MenuWithPermissionsDto
        {
            public long MenuId { get; set; }
            public string? Title { get; set; }
            public string? Icon { get; set; }
            public string? Route { get; set; }
            public int? ParentId { get; set; }
            public bool CanRead { get; set; } = false;
            public bool CanWrite { get; set; } = false;
            public bool CanCreate { get; set; } = false;
            public bool CanDelete { get; set; } = false;
            public bool CanImport { get; set; } = false;
            public bool CanExport { get; set; } = false;
        }

    }
}


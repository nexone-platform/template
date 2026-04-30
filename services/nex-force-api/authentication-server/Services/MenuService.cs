using Middleware.Data;
using Middlewares.Models;
using Microsoft.EntityFrameworkCore;
using static authentication_server.Controllers.RegistationController;
using Microsoft.AspNetCore.Identity.Data;
using Middleware.Models;
using Middlewares;
using static authentication_server.Services.RoleService;
using System.Data;
using ZstdSharp.Unsafe;
namespace authentication_server.Services
{
    public class MenuService
    {
        private readonly TokenService _tokenService;
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly IConfiguration _configuration;
        public MenuService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor, IConfiguration configuration, TokenService tokenService)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
            _tokenService = tokenService;
        }
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public async Task<Menu> CreateOrUpdateMenuAsync(MenuDTO menuDto)
        {
            Menu menuEntity;

            if (menuDto.MenusId > 0)
            {
                // Update existing menu
                menuEntity = await _context.Menus.FindAsync(menuDto.MenusId);
                if (menuEntity == null)
                {
                    throw new Exception("Menu not found.");
                }
                var parentMenuSeq = (await _context.Menus
                 .Where(m => m.MenusId == menuDto.ParentId)
                 .Select(m => m.MenuSeq)
                 .FirstOrDefaultAsync()) ?? 0; // กรณีที่ไม่พบเมนู จะใช้ค่า 0 เป็นค่าเริ่มต้น

                parentMenuSeq += 1;
                // Map DTO to entity
                menuEntity.Title = menuDto.Title;
                menuEntity.Icon = menuDto.Icon;
                menuEntity.ShowAsTab = menuDto.ShowAsTab;
                menuEntity.SeparateRoute = menuDto.SeparateRoute;
                menuEntity.MenuValue = menuDto.MenuValue;
                menuEntity.Route = menuDto.Route;
                menuEntity.HasSubRoute = menuDto.HasSubRoute;
                menuEntity.ShowSubRoute = menuDto.ShowSubRoute;
                menuEntity.ParentId = menuDto.ParentId;
                menuEntity.Base = menuDto.Base;
                menuEntity.Materialicons = menuDto.Materialicons;
                menuEntity.Page = menuDto.Page;
                menuEntity.Page1 = menuDto.Page1;
                menuEntity.Page2 = menuDto.Page2;
                menuEntity.Base2 = menuDto.Base2;
                menuEntity.Base3 = menuDto.Base3;
                menuEntity.Base4 = menuDto.Base4;
                menuEntity.Base5 = menuDto.Base5;
                menuEntity.Base6 = menuDto.Base6;
                menuEntity.Base7 = menuDto.Base7;
                menuEntity.Base8 = menuDto.Base8;
                menuEntity.UpdateDate = DateTime.UtcNow;
                menuEntity.UpdateBy = menuDto.Username;
                menuEntity.CreateDate = menuEntity.CreateDate = menuEntity.CreateDate.HasValue
                                        ? (menuEntity.CreateDate.Value == null ? (DateTime?)null : menuEntity.CreateDate.Value.ToUniversalTime())
                                        : (DateTime?)null;
                menuEntity.IsActive = menuDto.IsActive; 
                menuEntity.MenuCode = menuDto.Menucode;
                menuEntity.MenuSeq = parentMenuSeq;
                menuEntity.PageKey = menuDto.Base;
                menuEntity.TitleTh = menuDto.TitleTh;
                _context.Menus.Update(menuEntity);
            }
            else
            {
                int newMenusId  = (await _context.Menus.MaxAsync(r => (int?)r.MenusId) ?? 0) + 1;

                var parentMenuSeq = (await _context.Menus
                     .Where(m => m.MenusId == menuDto.ParentId)
                     .Select(m => m.MenuSeq)
                     .FirstOrDefaultAsync()) ?? 0; // กรณีที่ไม่พบเมนู จะใช้ค่า 0 เป็นค่าเริ่มต้น

                parentMenuSeq += 1;


                // Create new menu
                menuEntity = new Menu
                {
                    MenusId = newMenusId,
                    Title = menuDto.Title,
                    Icon = menuDto.Icon,
                    ShowAsTab = menuDto.ShowAsTab,
                    SeparateRoute = menuDto.SeparateRoute,
                    MenuValue = menuDto.MenuValue,
                    Route = menuDto.Route,
                    HasSubRoute = menuDto.HasSubRoute,
                    ShowSubRoute = menuDto.ShowSubRoute,
                    ParentId = menuDto.ParentId,
                    Base = menuDto.Base,
                    Materialicons = menuDto.Materialicons,
                    Page = menuDto.Page,
                    Page1 = menuDto.Page1,
                    Page2 = menuDto.Page2,
                    Base2 = menuDto.Base2,
                    Base3 = menuDto.Base3,
                    Base4 = menuDto.Base4,
                    Base5 = menuDto.Base5,
                    Base6 = menuDto.Base6,
                    Base7 = menuDto.Base7,
                    Base8 = menuDto.Base8,
                    CreateBy  = menuDto.Username,
                    CreateDate = DateTime.UtcNow,
                    IsActive = menuDto.IsActive,
                    MenuCode = menuDto.Menucode,
                    MenuSeq = parentMenuSeq,
                    PageKey = menuDto.Base,
                    TitleTh = menuDto.TitleTh
                };

                _context.Menus.Add(menuEntity);

                var roles = await _context.Roles.ToListAsync();
                var rolePermissions = roles.Select(role => new RolePermission
                {
                    RoleId = role.RoleId,
                    MenusId = menuEntity.MenusId, // ใช้ MenuId ที่เพิ่งถูกสร้าง
                    CanView = true,  
                    CanEdit = true,
                    CanAdd = true,
                    CanDelete = true,
                    CanImport = true,
                    CanExport = true,
                    IsActive = true,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = menuDto.Username
                }).ToList();

                await _context.RolePermissions.AddRangeAsync(rolePermissions);
            }
            if (!string.IsNullOrWhiteSpace(menuDto.Base))
            {
                var existingPage = await _context.Pages
                    .FirstOrDefaultAsync(p => p.PageKey == menuDto.Base);

                if (existingPage != null)
                {
                    // กรณี Edit page ที่มีอยู่
                    existingPage.Description = menuDto.Title;
                    existingPage.UpdateDate = DateTime.UtcNow;
                    existingPage.UpdateBy = menuDto.Username;

                    _context.Pages.Update(existingPage);
                }
                else
                {
                    // กรณีสร้างใหม่
                    var newPage = new Page
                    {
                        PageKey = menuDto.Base,
                        Description = menuDto.Title,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = menuDto.Username
                    };
                    _context.Pages.Add(newPage);
                }
            }
            if (!string.IsNullOrWhiteSpace(menuDto.Base))
            {
                var pageKey = menuDto.Base;
                var labelKey = "title";

                // ---------- ภาษาไทย
                if (!string.IsNullOrWhiteSpace(menuDto.TitleTh))
                {
                    var translationTh = await _context.LanguageTranslations.FirstOrDefaultAsync(t =>
                        t.PageKey == pageKey &&
                        t.LabelKey == labelKey &&
                        t.LanguageCode == "th");

                    if (translationTh != null)
                    {
                        translationTh.LabelValue = menuDto.TitleTh;
                        translationTh.UpdateDate = DateTime.UtcNow;
                        translationTh.UpdateBy = menuDto.Username;
                    }
                    else
                    {
                        _context.LanguageTranslations.Add(new LanguageTranslation
                        {
                            LanguageCode = "th",
                            PageKey = pageKey,
                            LabelKey = labelKey,
                            LabelValue = menuDto.TitleTh,
                            CreateDate = DateTime.UtcNow,
                            CreateBy = menuDto.Username
                        });
                    }
                }

                // ---------- ภาษาอังกฤษ
                if (!string.IsNullOrWhiteSpace(menuDto.Title))
                {
                    var translationEn = await _context.LanguageTranslations.FirstOrDefaultAsync(t =>
                        t.PageKey == pageKey &&
                        t.LabelKey == labelKey &&
                        t.LanguageCode == "en");

                    if (translationEn != null)
                    {
                        translationEn.LabelValue = menuDto.Title;
                        translationEn.UpdateDate = DateTime.UtcNow;
                        translationEn.UpdateBy = menuDto.Username;
                    }
                    else
                    {
                        _context.LanguageTranslations.Add(new LanguageTranslation
                        {
                            LanguageCode = "en",
                            PageKey = pageKey,
                            LabelKey = labelKey,
                            LabelValue = menuDto.Title,
                            CreateDate = DateTime.UtcNow,
                            CreateBy = menuDto.Username
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();
            return menuEntity;
        }

        public class MenuRes
        {
            public int MenusId { get; set; }
            public string Title { get; set; }
            public int? ParentId { get; set; }
            public List<MenuRes>? Children { get; set; }
        }

        public async Task<List<MenuRes>> GetMenuHierarchy()
        {
            var menus = await _context.Menus
                .Where(menu => menu.IsActive)
                .OrderBy(m => m.MenuCode) 
                .ThenBy(m => m.ParentId)  
                .Select(m => new MenuRes
                {
                    MenusId = m.MenusId,
                    Title = m.Title,
                    ParentId = m.ParentId
                })
                .ToListAsync();

            return BuildTree(menus);
        }

        private List<MenuRes> BuildTree(List<MenuRes> menus)
        {
            var menuMap = menus.ToDictionary(m => m.MenusId);
            List<MenuRes> rootMenus = new();

            foreach (var menu in menus)
            {
                if (menu.ParentId != null && menuMap.ContainsKey(menu.ParentId.Value))
                {
                    if (menuMap[menu.ParentId.Value].Children == null)
                    {
                        menuMap[menu.ParentId.Value].Children = new List<MenuRes>();
                    }
                    menuMap[menu.ParentId.Value].Children.Add(menu);
                }
                else
                {
                    rootMenus.Add(menu);
                }
            }

            return rootMenus;
        }

        public class SubMenuDto
        {
            public int MenusId { get; set; }
            public string? MenuValue { get; set; }
            public string? Route { get; set; }
            public string? Base { get; set; }
            public string? Base2 { get; set; }
            public string? Base3 { get; set; }
            public string? Base4 { get; set; }
            public string? Base5 { get; set; }
            public string? Base6 { get; set; }
            public string? Base7 { get; set; }
            public string? Base8 { get; set; }
            public bool CurrentActive { get; set; } = false;
            public bool HasSubRoute { get; set; }
            public bool ShowSubRoute { get; set; }
            public string? Icon { get; set; }
            public string? MaterialIcons { get; set; }
            public string? TitleTh { get; set; }
            public string? PageKey { get; set; }
            public List<SubMenuDto> SubMenus { get; set; } = new List<SubMenuDto>();
        }

        public class MenuDto
        {
          
            public int MenusId { get; set; }
            public string? Tittle { get; set; }
            public string? Icon { get; set; }
            public bool? ShowAsTab { get; set; }
            public bool? SeparateRoute { get; set; }
            public string? Route { get; set; }
            public string? PageKey { get; set; }
            public string? TitleTh { get; set; }
            public List<SubMenuDto> Menu { get; set; } = new List<SubMenuDto>();
            public PermissionDto Permissions { get; set; }
        }

        public class PermissionDto
        {
            public bool CanView { get; set; }
            public bool CanEdit { get; set; }
            public bool CanAdd { get; set; }
            public bool CanDelete { get; set; }
            public bool CanImport { get; set; }
            public bool CanExport { get; set; }
        }

        public class MenuDTO
        {
            public int MenusId { get; set; }
            public string? Title { get; set; }
            public string? Icon { get; set; }
            public bool? ShowAsTab { get; set; }
            public bool? SeparateRoute { get; set; }
            public string? MenuValue { get; set; }
            public string? Route { get; set; }
            public bool HasSubRoute { get; set; }
            public bool ShowSubRoute { get; set; }
            public int? ParentId { get; set; }
            public string? Base { get; set; }
            public string? Materialicons { get; set; }
            public string? Page { get; set; }
            public string? Page1 { get; set; }
            public string? Page2 { get; set; }
            public string? Base2 { get; set; }
            public string? Base3 { get; set; }
            public string? Base4 { get; set; }
            public string? Base5 { get; set; }
            public string? Base6 { get; set; }
            public string? Base7 { get; set; }
            public string? Base8 { get; set; }
            public string? Username { get; set; }
            public string? Menucode { get; set; }
            public bool IsActive { get; set; }
            public string? PageKey { get; set; }
            public string? TitleTh { get; set; }
        }
    }
}

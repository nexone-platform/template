using authentication_server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;
using static authentication_server.Services.MenuService;

namespace authentication_server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly MenuService _menuService;
        public MenuController(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor, MenuService menuService)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _loggingService = loggingService;
            _menuService = menuService;
        }

        [HttpGet]
        public async Task<ActionResult<List<MenuDto>>> GetSideBarMenus()
        {
            var menus = await _context.Menus.ToListAsync();

            var menuDtos = menus
                .Where(m => m.ParentId == null && m.IsActive == true ) // Get the root menus
                .OrderBy(m => m.MenuCode)
                .Select(menu => new MenuDto
                {
                    MenuId = menu.MenuId,
                    Tittle = menu.Title,
                    Icon = menu.Icon,
                    Route = menu.Route,
                    Menu = menus
                        .Where(subMenu => subMenu.ParentId == menu.MenuId && subMenu.IsActive == true) // Find submenus for this parent
                        .OrderBy(m => m.MenuCode)
                        .Select(subMenu => new SubMenuDto
                        {
                            MenuId = subMenu.MenuId,  
                            MenuValue = subMenu.MenuValue,
                            Route = subMenu.Route,
                            Base = subMenu.Base,
                            Icon = subMenu.Icon,
                            SubMenus = menus
                                .Where(subSubMenu => subSubMenu.ParentId == subMenu.MenuId && subMenu.IsActive == true) // Find subsubmenus for this submenu
                                .OrderBy(m => m.MenuCode)
                                .Select(subSubMenu => new SubMenuDto
                                {
                                    MenuId = subSubMenu.MenuId,  
                                    MenuValue = subSubMenu.MenuValue,
                                    Route = subSubMenu.Route,
                                    Base = subSubMenu.Base,
                                    CurrentActive = false,
                                }).ToList()
                        }).ToList()
                }).ToList();

            return Ok(menuDtos);
        }

        [HttpGet("{empId}")]
        public async Task<ActionResult<List<MenuDto>>> GetSideBarMenus(string empId)
        {
            if (string.IsNullOrEmpty(empId))
            {
                return BadRequest(new { message = "Employee ID is required." });
            }

            // Get the user's role based on employee ID
            var user = await _context.Users
                .Where(u => u.EmployeeId == empId && u.IsActive == true)
                .Select(u => new { u.RoleId })
                .FirstOrDefaultAsync();

            if (user == null || user.RoleId == null)
            {
                throw new Exception("Employee not found or has no assigned role."); // Employee not found or has no assigned role
            }

            decimal roleId = user.RoleId.Value;

            // Join menus with permissions for the user's role
            var menusWithPermissions = await (from m in _context.Menus
                                              join rp in _context.RolePermissions
                                              on m.MenuId equals rp.MenuId
                                              where rp.RoleId == roleId && rp.IsActive && m.IsActive
                                              select new
                                              {
                                                  Menu = m    
                                              }).ToListAsync();

            var menuDtos = menusWithPermissions
                .Where(m => m.Menu.ParentId == null)
                .OrderBy(m => m.Menu.MenuCode)
                .Select(menu => new MenuDto
                {
                    MenuId = menu.Menu.MenuId,
                    Tittle = menu.Menu.Title,
                    Icon = menu.Menu.Icon,
                    Route = menu.Menu.Route,
                    Menu = menusWithPermissions
                        .Where(subMenu => subMenu.Menu.ParentId == menu.Menu.MenuId)
                        .OrderBy(m => m.Menu.MenuCode)
                        .Select(subMenu => new SubMenuDto
                        {
                            MenuId = subMenu.Menu.MenuId,
                            MenuValue = subMenu.Menu.MenuValue,
                            Route = subMenu.Menu.Route,
                            Base = subMenu.Menu.Base,
                            Icon = subMenu.Menu.Icon,
                            SubMenus = menusWithPermissions
                                .Where(subSubMenu => subSubMenu.Menu.ParentId == subMenu.Menu.MenuId)
                                .OrderBy(m => m.Menu.MenuCode)
                                .Select(subSubMenu => new SubMenuDto
                                {
                                    MenuId = subSubMenu.Menu.MenuId,
                                    MenuValue = subSubMenu.Menu.MenuValue,
                                    Route = subSubMenu.Menu.Route,
                                    Base = subSubMenu.Menu.Base,
                                    CurrentActive = false,
                                }).ToList()
                        }).ToList()
                }).ToList();

            return Ok(menuDtos);
        }

        [HttpGet("{empId}/{languageCode}")]
        public async Task<ActionResult<List<MenuDto>>> GetSideBarMenus(string empId, string languageCode)
        {
            if (string.IsNullOrEmpty(empId))
                return BadRequest(new { message = "Employee ID is required." });

            var user = await _context.Users
                .Where(u => u.EmployeeId == empId && u.IsActive == true)
                .Select(u => new { u.RoleId })
                .FirstOrDefaultAsync();

            if (user == null || user.RoleId == null)
                return NotFound(new { message = "Employee not found or has no assigned role." });

            var roleId = user.RoleId.Value;

            // โหลดเมนู พร้อมคำแปลภาษา
            var menusWithLabels = await (
                from m in _context.Menus
                join rp in _context.RolePermissions on m.MenuId equals rp.MenuId
                where rp.RoleId == roleId && rp.IsActive && m.IsActive

                join label in _context.LanguageTranslations
                    on new { Lang = languageCode, PageKey = "menu", LabelKey = (m.MenuCode ?? m.Base) }
                    equals new { Lang = label.LanguageCode, PageKey = label.PageKey, LabelKey = label.LabelKey }
                    into trans
                from t in trans.DefaultIfEmpty()

                    // JOIN ไปยัง pages
                join p in _context.Pages
                    on m.Base equals p.PageKey into pg
                from page in pg.DefaultIfEmpty()

                select new
                {
                    Menu = m,
                    Label = t.LabelValue ?? m.Title,
                    PageKey = page.PageKey,
                    PageDescription = page.Description 
                }
            ).ToListAsync();

            // จัดกลุ่มเมนูหลักและเมนูย่อย
            var menuDtos = menusWithLabels
                .Where(m => m.Menu.ParentId == null)
                .OrderBy(m => m.Menu.MenuCode)
                .Select(menu => new MenuDto
                {
                    MenuId = menu.Menu.MenuId,
                    Tittle = menu.Label, 
                    Icon = menu.Menu.Icon,
                    Route = menu.Menu.Route,
                    PageKey = menu.PageKey,
                    Menu = menusWithLabels
                        .Where(sub => sub.Menu.ParentId == menu.Menu.MenuId)
                        .OrderBy(m => m.Menu.MenuCode)
                        .Select(subMenu => new SubMenuDto
                        {
                            MenuId = subMenu.Menu.MenuId,
                            MenuValue = subMenu.Label,
                            Route = subMenu.Menu.Route,
                            Base = subMenu.Menu.Base,
                            Icon = subMenu.Menu.Icon,
                            PageKey = subMenu.PageKey,
                            SubMenus = menusWithLabels
                                .Where(ssm => ssm.Menu.ParentId == subMenu.Menu.MenuId)
                                .OrderBy(m => m.Menu.MenuCode)
                                .Select(subSubMenu => new SubMenuDto
                                {
                                    MenuId = subSubMenu.Menu.MenuId,
                                    PageKey = subSubMenu.PageKey,
                                    MenuValue = subSubMenu.Label,
                                    Route = subSubMenu.Menu.Route,
                                    Base = subSubMenu.Menu.Base,
                                    CurrentActive = false
                                }).ToList()
                        }).ToList()
                }).ToList();

            return Ok(menuDtos);
        }


        [HttpGet("menulist")]
        public async Task<ActionResult<ApiResponse<Menu>>> GetMenus()
        {
            var menus = await _context.Menus.Where(menu => menu.IsActive == true).OrderBy(m => m.MenuCode ).ThenBy(m => m.ParentId).ToListAsync();

            var response = new ApiResponse<Menu>
            {
                Data = menus,
                TotalData = menus.Count
            };

            return Ok(response);
        }

        [HttpGet("menulistForRole")]
        public async Task<IActionResult> GetMenusList()
        {
            var menus = await _menuService.GetMenuHierarchy();
            return Ok(menus);
        }


        [HttpPost("update")]
        public async Task<ActionResult<MenuDTO>> CreateOrUpdateMenu(MenuDTO menuDto)
        {
            var response = await _menuService.CreateOrUpdateMenuAsync(menuDto);
            if (response == null)
            {
                return NotFound(new { message = "Menu not found for update" });
            }

            return Ok(response);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteMenu(int id)
        {
            // ค้นหาเมนูตาม ID
            var menu = await _context.Menus.FindAsync(id);
            if (menu == null)
            {
                return NotFound(new { message = "Menu not found" });
            }

            // ค้นหา RolePermissions ที่เกี่ยวข้องกับเมนูนี้
            var rolePermissions = _context.RolePermissions.Where(rp => rp.MenuId == id);

            // ลบ RolePermissions ทั้งหมดที่เกี่ยวข้อง
            _context.RolePermissions.RemoveRange(rolePermissions);

            // ลบเมนู
            _context.Menus.Remove(menu);

            // บันทึกการเปลี่ยนแปลง
            await _context.SaveChangesAsync();

            return Ok(new { message = "Menu and related permissions deleted successfully" });
        }


    }
}

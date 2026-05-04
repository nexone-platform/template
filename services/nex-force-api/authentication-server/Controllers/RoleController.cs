using authentication_server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using static authentication_server.Services.RoleService;

namespace authentication_server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly RoleService _roleService;
        public RoleController(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor, RoleService roleService)
        {
            _context = context;
            _loggingService = loggingService;
            _roleService= roleService;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApiResponse<Role>>>> GetTerminateTypes()
        {
            try
            {
                var leaveTypes = await _context.Roles.ToListAsync();
                var response = new ApiResponse<Role>
                {
                    Data = leaveTypes,
                    TotalData = leaveTypes.Count
                };

                return Ok(response);
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpsertRole([FromBody] RoleDto roleDto)
        {
            if (roleDto == null)
            {
                return BadRequest(new { message = "Invalid role data." });
            }

            try
            {
                var result = await _roleService.UpsertRoleAsync(roleDto);
                return Ok(new { message = "Role saved successfully", role = result });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "UpsertRole", roleDto.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteRole(decimal id)
        {
            // ค้นหา Role ตาม ID
            var role = await _context.Roles.FindAsync(id);
            if (role == null)
            {
                // ถ้าไม่พบ Role ให้คืนค่าผลลัพธ์ 404 Not Found
                return NotFound(new { message = "Role not found" });
            }

            bool isRoleUsed = await _context.Users.AnyAsync(u => u.RoleId == id);
            if (isRoleUsed)
            {
                return BadRequest(new { message = "Cannot delete role because it is assigned to users" });
            }

            // ค้นหา RolePermissions ที่เกี่ยวข้องกับ Role นี้
            var rolePermissions = _context.RolePermissions.Where(rp => rp.RoleId == id);

            // ลบ RolePermissions ที่เกี่ยวข้อง
            _context.RolePermissions.RemoveRange(rolePermissions);

            // ลบ Role
            _context.Roles.Remove(role);

            // บันทึกการเปลี่ยนแปลง
            await _context.SaveChangesAsync();

            // คืนค่าผลลัพธ์การลบ
            return Ok(new { message = "Role and related permissions deleted successfully" });
        }


        [HttpPost("create-or-update")]
        public async Task<IActionResult> CreateOrUpdateRolePermissions([FromBody] RolePermissionDTO model)
        {
            var success = await _roleService.CreateOrUpdateRolePermissionsAsync(model);
            if (!success)
                return BadRequest(new { message = "Invalid data provided." });

            return Ok(new { message = "Role permissions updated successfully." });
        }

        [HttpGet("role")]
        public async Task<IActionResult> GetPermissions(int roleId)
        {
            var permissions = await _roleService.GetPermissionsData(roleId);
            return Ok(permissions); // ส่งข้อมูลทั้งหมด
        }

        [HttpGet("getPermission/{empId}/{menuId}")]
        public async Task<ActionResult<ApiResponse<RolePermissionDto>>> GetPermission(string empId, int menuId)
        {
            try
            {
                if (string.IsNullOrEmpty(empId))
                {
                    return BadRequest(new { message = "Employee ID is required." });
                }

                var user = await _context.Users
                    .Where(u => u.EmployeeId == empId && u.IsActive == true)
                    .Select(u => new { u.RoleId })
                    .FirstOrDefaultAsync();

                if (user == null || user.RoleId == null)
                {
                    return Forbid();
                }

                decimal roleId = user.RoleId.Value;

                var permissions = await _context.RolePermissions
                    .Where(rp => rp.RoleId == roleId && rp.IsActive && rp.MenuId == menuId) // เพิ่มเงื่อนไขตรงนี้
                    .Select(rp => new RolePermissionDto
                    {
                        MenuId = rp.MenuId,
                        CanView = rp.CanView,
                        CanEdit = rp.CanEdit,
                        CanAdd = rp.CanAdd,
                        CanDelete = rp.CanDelete,
                        CanImport = rp.CanImport,
                        CanExport = rp.CanExport
                    }).FirstOrDefaultAsync(); ;

                return Ok(permissions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }


        public class RolePermissionDto
        {
            public long MenuId { get; set; }
            public bool CanView { get; set; }
            public bool CanEdit { get; set; }
            public bool CanAdd { get; set; }
            public bool CanDelete { get; set; }
            public bool CanImport { get; set; }
            public bool CanExport { get; set; }
        }

    }

}


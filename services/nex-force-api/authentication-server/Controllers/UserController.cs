using authentication_server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using System;
using System.Security.Claims;
using static authentication_server.Services.UserService;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace authentication_server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public class UserModel {
            public string UserName { get; set; }
            public decimal Id { get; set; }
            public string Email { get; set; }
            public string Name { get; set; }
            public string ProfileImg { get; set; }
        }

        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly UserService _userService;
        public UserController(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor, UserService userService)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApiResponse<User>>>> GetTerminateTypes()
        {
            try
            {
                var users = await (from u in _context.Users
                                   join r in _context.Roles on u.RoleId equals r.RoleId into roleJoin
                                   from r in roleJoin.DefaultIfEmpty()
                                   join e in _context.Employees on u.EmployeeId equals e.EmployeeId into empJoin
                                   from e in empJoin.DefaultIfEmpty()
                                   orderby u.UpdateDate descending
                                   select new UserDto
                                   {
                                       UserId = u.UserId,
                                       EmployeeId = u.EmployeeId,
                                       EmployeeName = e != null ? e.FirstNameEn + " " + e.LastNameEn : null,
                                       Email = u.Email,
                                       RoleId = u.RoleId,
                                       RoleName = r != null ? r.RoleName : null,
                                       CreateDate = u.CreateDate,
                                       CreateBy = u.CreateBy,
                                       ImgPath = !string.IsNullOrEmpty(e.ImgPath) ? e.ImgPath : null,
                                       EmpId = e.Id,
                                       IsActive = u.IsActive,
                                   }).ToListAsync();

                var response = new ApiResponse<UserDto>
                {
                    Data = users,
                    TotalData = users.Count
                };


                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        public class UserDto
        {
            public int UserId { get; set; }
            public string? EmployeeId { get; set; }
            public string? EmployeeName { get; set; }
            public string? Email { get; set; }
            public decimal? RoleId { get; set; }
            public string? RoleName { get; set; }
            public DateTime? CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public string? ImgPath { get; set; }
            public decimal? EmpId { get; set; }
            public string? Password { get; set; }
            public bool? IsActive { get; set; }

        }
        [HttpPost("update")]
        public async Task<IActionResult> AddOrUpdateUser([FromBody] UserDTO userDto)
        {
            try
            {
                var user = await _userService.AddOrUpdateUser(userDto);
                return Ok(new { message = userDto.UserId == 0 ? "User added successfully" : "User updated successfully", UserId = user.UserId });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            // Find the holiday by its ID
            var tasks = await _context.Users.FindAsync(id);
            if (tasks == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "Users not found" });
            }

            // Remove the holiday from the database
            _context.Users.Remove(tasks);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "Users deleted successfully" });
        }
    }
}

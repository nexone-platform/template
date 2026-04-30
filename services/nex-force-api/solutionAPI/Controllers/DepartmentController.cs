using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using System.Security.Claims;
using static solutionAPI.Controllers.HolidayController;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DepartmentController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public DepartmentController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }
        [HttpGet("getAllDepartment")]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartment()
        {
            var departments = await _context.Departments.ToListAsync();
            var response = new ApiResponse<Department>
            {
                Data = departments,
                TotalData = departments.Count
            };
            return Ok(response);
        }

        [HttpPost("update")]
        public async Task<ActionResult<IEnumerable<Department>>> CreateOrUpdateEmployee([FromBody] Department department)
        {
            var localDateTime = DateTime.Now; // Local time
            var utcDateTime = localDateTime.ToUniversalTime(); // Convert to UTC
            if (department == null)
            {
                return BadRequest(new { message = "Invalid department data." });
            }
            try
            {
                if (department.DepartmentId > 0)
                {  // Update existing 
                    var existingDepartment = await _context.Departments
                        .FirstOrDefaultAsync(e => e.DepartmentId == department.DepartmentId);
                    if (existingDepartment == null)
                    {
                        return NotFound(new { message = $"Department with ID {department.DepartmentId} not found." });
                    }
                    existingDepartment.UpdateBy = GetCurrentUserId();
                    existingDepartment.UpdateDate = utcDateTime;
                    existingDepartment.DepartmentNameEn = department.DepartmentNameEn;
                    existingDepartment.DepartmentNameTh = department.DepartmentNameTh;
                    existingDepartment.CreateDate = department.CreateDate;
                    existingDepartment.DepartmentCode = department.DepartmentCode;
                    _context.Departments.Update(existingDepartment);
                }
                else
                {
                    var maxId = await _context.Departments
                                .MaxAsync(e => (int?)e.DepartmentId);
                    if (maxId == null)
                    {
                        // Handle the case where the table is empty
                        maxId = 0;
                    }
                    else
                    {
                        maxId = maxId + 1;
                    }

                    var newDepartment = new Department
                    {
                        DepartmentId = (int)maxId,
                        DepartmentNameEn = department.DepartmentNameEn,
                        DepartmentNameTh = department.DepartmentNameTh,
                        CreateDate = utcDateTime,
                        DepartmentCode = department.DepartmentCode,
                        CreateBy = GetCurrentUserId()
                    };

                    _context.Departments.Add(newDepartment);
                }
                await _context.SaveChangesAsync();

                return Ok(new { message = "Department save successfully" });
            }
            catch (DbUpdateException ex)
            {
                // 🔴 Unique constraint (department_code)
                if (ex.InnerException != null &&
                    ex.InnerException.Message.Contains("ix-uk-department"))
                {
                    return Conflict(new
                    {
                        message = "Department code already exists."
                    });
                }

        return StatusCode(500, new
        {
            message = "Database update error.",
            detail = ex.InnerException?.Message
        });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                                     {
                                         message = "Unexpected error occurred.",
                                         detail = ex.Message
                                     });
            }
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound(new { message = "Department not found" });
            }
            _context.Departments.Remove(department);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Department deleted successfully" });
        }
        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            return username;
        }
    }
}

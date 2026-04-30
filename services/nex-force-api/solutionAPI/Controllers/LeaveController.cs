using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares.Models;
using System.Security.Claims;
using static solutionAPI.Controllers.ProjectsController;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LeaveController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public LeaveController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }
        [HttpGet("getMasterLeaveType")]
        public async Task<ActionResult<IEnumerable<ApiResponse<LeaveType>>>> GetLeaveType()
        {
            try
            {
                var leaveTypes = await _context.LeaveTypes.ToListAsync();
                var response = new ApiResponse<LeaveType>
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

        public class LeaveTypeDTO
        {
            public string? username { get; set; }
            public int LeaveTypeId { get; set; } // leave_type_id
            public string? LeaveTypeNameTh { get; set; } // leave_type_name
            public string? LeaveTypeNameEn { get; set; } // leave_type_name
            public string? LeaveTypeCode { get; set; }
        }

        [HttpPost("leaveType/update")]
        public async Task<ActionResult<IEnumerable<ProjectType>>> CreateOrUpdateEmployee([FromBody] LeaveTypeDTO leaveType)
        {
            var localDateTime = DateTime.Now; // Local time
            var utcDateTime = localDateTime.ToUniversalTime(); // Convert to UTC
            if (leaveType == null)
            {
                return BadRequest(new { message = "Invalid leaveType data." });
            }
            if (leaveType.LeaveTypeId > 0)
            {  // Update existing 
                var existingLeaveType = await _context.LeaveTypes
                    .FirstOrDefaultAsync(e => e.LeaveTypeId == leaveType.LeaveTypeId);
                if (existingLeaveType == null)
                {
                    return NotFound(new { message = $"LeaveType with ID {leaveType.LeaveTypeId} not found." });
                }
                existingLeaveType.UpdateBy = leaveType.username;
                existingLeaveType.UpdateDate = utcDateTime;
                existingLeaveType.LeaveTypeNameEn = leaveType.LeaveTypeNameEn;
                existingLeaveType.LeaveTypeNameTh = leaveType.LeaveTypeNameTh;
                existingLeaveType.CreateDate = existingLeaveType.CreateDate;
                existingLeaveType.LeaveTypeCode = leaveType.LeaveTypeCode;
                _context.LeaveTypes.Update(existingLeaveType);
            }
            else
            {
                var maxId = await _context.LeaveTypes
                            .MaxAsync(e => (int?)e.LeaveTypeId);
                if (maxId == null)
                {
                    // Handle the case where the table is empty
                    maxId = 0;
                }
                else
                {
                    maxId = maxId + 1;
                }

                var newLeaveType = new LeaveType
                {
                    LeaveTypeId = (int)maxId,
                    LeaveTypeNameTh = leaveType.LeaveTypeNameTh,
                    LeaveTypeNameEn = leaveType.LeaveTypeNameEn,
                    CreateDate = utcDateTime,
                    LeaveTypeCode = leaveType.LeaveTypeCode,
                    CreateBy = leaveType.username
                };

                _context.LeaveTypes.Add(newLeaveType);
            }
            await _context.SaveChangesAsync();

            return Ok(new { message = "LeaveType save successfully" });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLeaveById(int id)
        {
            var overtime = await _context.LeaveRequests
                .FirstOrDefaultAsync(o => o.LeaveRequestId == id);

            if (overtime == null)
                return NotFound(new { message = $"Overtime request {id} not found." });

            return Ok(overtime);
        }

        [HttpDelete("leaveType/delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var leaveQuotas = await _context.LeaveTypes.FindAsync(id);
            if (leaveQuotas == null)
            {
                return NotFound(new { message = "Leave Types not found" });
            }
            _context.LeaveTypes.Remove(leaveQuotas);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Leave Types deleted successfully" });
        }
    }
}

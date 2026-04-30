using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using solutionAPI.Services;
using static solutionAPI.Services.LeaveQuotaService;

namespace solutionAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class LeaveQuotaController : ControllerBase
    {
        private readonly ILoggingService _loggingService;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly LeaveQuotaService _leaveQuotaService;
        public LeaveQuotaController(ApplicationDbContext context, IMapper mapper, ILoggingService loggingService, LeaveQuotaService leaveQuotaService)
        {
            _mapper = mapper;
            _loggingService = loggingService;
            _context = context;
            _leaveQuotaService = leaveQuotaService;
        }
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        [HttpGet("getLeaves")]
        public async Task<IActionResult> GetLeaveGroupedByEmployee()
        {
            try
            {
                var leaveQuotas = await _leaveQuotaService.GetAllLeaveQuotasAsync();
                var response = new ApiResponse<LeaveQuotaResponseDto>
                {
                    Data = leaveQuotas.ToList(), // Convert to list if necessary
                    TotalData = leaveQuotas.Count() // Get the count of total data
                };

                // Return a 200 OK response with the data
                return Ok(response);

            }
            catch (Exception ex)
                {
                _loggingService.LogError(ex.Message, ex.Message, "update-leave quota", "Username");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
                }  
            }

        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<LeaveQuota>>> GetLeaveQuotaByEmployee(int employeeId)
        {
            var leaveQuotas = await _context.LeaveQuotas
                .Include(lq => lq.LeaveType)
                .Where(lq => lq.EmployeeId == employeeId)
                .ToListAsync();
/*
            if (leaveQuotas == null || !leaveQuotas.Any())
            {
                return NotFound();
            }*/

            return Ok(leaveQuotas);
        }
        [HttpPost("update")]
        public async Task<IActionResult> AddLeaveQuota([FromBody] LeaveQuotaDto leaveQuotaDto)
        {
            if (leaveQuotaDto == null)
            {
                return BadRequest(new { message = "Leave quota data is required." });
            }

            await _leaveQuotaService.AddLeaveQuotaAsync(leaveQuotaDto);
            return CreatedAtAction(nameof(AddLeaveQuota), new { employeeId = leaveQuotaDto.EmployeeId, year = leaveQuotaDto.Year }, leaveQuotaDto);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(decimal id)
        {
            var leaveQuotas = await _context.LeaveQuotas.FindAsync(id);
            if (leaveQuotas == null)
            {
                return NotFound(new { message = "LeaveQuotas not found" });
            }
            _context.LeaveQuotas.Remove(leaveQuotas);

            await _context.SaveChangesAsync();

            return Ok(new { message = "LeaveQuotas deleted successfully" });
        }

    }
}

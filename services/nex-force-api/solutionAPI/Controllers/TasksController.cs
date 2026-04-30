using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;
using solutionAPI.Services;
using static solutionAPI.Services.TasksService;
namespace solutionAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly TasksService _taxService;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILoggingService _loggingService;
        public TasksController(ApplicationDbContext context, IMapper mapper, TasksService taxService, ILoggingService loggingService)
        {
            _mapper = mapper;
            _context = context;
            _taxService = taxService;
            _loggingService = loggingService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApiResponse<Tasks>>>> GetTerminateTypes()
        {
            try
            {
                var leaveTypes = await _context.Tasks.ToListAsync();
                var response = new ApiResponse<Tasks>
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
        public async Task<IActionResult> CreateOrUpdatePromotion([FromBody] TaskUpdateDto taskUpdateDto)
        {
            if (taskUpdateDto == null)
            {
                return BadRequest(new { message = "Invalid task data." });
            }

            try
            {
                var result = await _taxService.CreateOrUpdateAsync(taskUpdateDto);
                return Ok(new { message = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "update-SaveTask", taskUpdateDto.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteTax(int id)
        {
            var tasks = await _context.Tasks.FindAsync(id);
            if (tasks == null)
            {
                return NotFound(new { message = "Tasks not found" });
            }
            _context.Tasks.Remove(tasks);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tasks deleted successfully" });
        }

    }
}

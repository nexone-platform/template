
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares.Models;
using performance_server.Service;
using static performance_server.Service.TerminationService;
namespace performance_server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TerminateController : ControllerBase
    {
        private readonly TerminationService _terminationService;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public TerminateController(ApplicationDbContext context, IMapper mapper, TerminationService terminationService)
        {
            _mapper = mapper;
            _context = context;
            _terminationService = terminationService;
        }
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        [HttpGet("getType")]
        public async Task<ActionResult<IEnumerable<ApiResponse<TerminateType>>>> GetTerminateTypes()
        {
            try
            {
                var leaveTypes = await _context.TerminateTypes.ToListAsync();
                var response = new ApiResponse<TerminateType>
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApiResponse<TerminateDto>>>> GetTerminate()
        {
            try
            {
                var response = await _terminationService.GetTerminationsAsync();

                return Ok(response);

            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }

        }

        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdatePromotion([FromBody] TerminateDTO terminateDto)
        {
            if (terminateDto == null)
            {
                return BadRequest(new { message = "Invalid termination data." });
            }

            try
            {
                await _terminationService.SaveTerminateAsync(terminateDto);
                return Ok(new { message = "TerminateDto saved successfully." });
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

        [HttpPost("terminateType/save")]
        public async Task<IActionResult> SaveTerminateType([FromBody] TerminateTypeDTO terminateTypeDto)
        {
             if (terminateTypeDto == null)
            {
                return BadRequest(new { message = "Invalid terminate type data." });
            }

            try
            {
                var result = await _terminationService.CreateOrUpdateTerminateTypeAsync(terminateTypeDto);
                return Ok(new { message = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred." });
            }
        }

        [HttpDelete("deleteType")]
        public async Task<IActionResult> DeleteTerminateType(int id)
        {
            // Find the holiday by its ID
            var holiday = await _context.TerminateTypes.FindAsync(id);
            if (holiday == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "Terminate Type not found" });
            }

            // Remove the holiday from the database
            _context.TerminateTypes.Remove(holiday);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "Terminate Type deleted successfully" });
        }
        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteTerminate(int id)
        {
            // Find the holiday by its ID
            var holiday = await _context.Terminates.FindAsync(id);
            if (holiday == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "Terminate not found" });
            }

            // Remove the holiday from the database
            _context.Terminates.Remove(holiday);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "Terminate deleted successfully" });
        }
    }
}

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Middleware.Data;
using Middlewares;
using solutionAPI.Services;

namespace solutionAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class EmploymentController : ControllerBase
    {
        private readonly EmploymentService _employmentService;

        public EmploymentController(EmploymentService employmentService)
        {
            _employmentService = employmentService;
        }

        [HttpGet()]
        public async Task<IActionResult> GetEmployments()
        {
            try
            {
                var response = await _employmentService.GetAllEmploymentsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpGet("{employeeId}")]
        public async Task<IActionResult> GetEmployments(decimal employeeId)
        {
            try
            {
                var response = await _employmentService.GetEmploymentsAsync(employeeId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpGet("histories/{employeeId}")]
        public async Task<IActionResult> GetEmploymentHistories(decimal employeeId)
        {
            try
            {
                var response = await _employmentService.GetEmploymentHistoryAsync(employeeId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

    }
}

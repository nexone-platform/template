using authentication_server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using static authentication_server.Services.DataSettingsService;

namespace authentication_server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class DataSettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly DataSettingsService  _dataSetingsService;
        public DataSettingsController(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor, DataSettingsService dataSettingsService)
        {
            _context = context;
            _loggingService = loggingService;
            _dataSetingsService = dataSettingsService;
            _httpContextAccessor = httpContextAccessor;
        }
        [HttpPost("")]
        public async Task<IActionResult> InitData([FromBody] InitDataRequest request)
        {

            try
            {


                //var result = await _context.LogCheckInOutResults
                //               .FromSqlRaw("SELECT \"solution-one\".\"fn_reset_solution_data\"({0}) AS Message", data.Username)
                //               .ToListAsync();

                // var result = "success";

                await _context.Database.ExecuteSqlRawAsync(
                    "SELECT \"solution-one\".\"fn_reset_solution_data\"({0})",
                    request.Username
                );

                //return Ok(result.Message);

                return Ok(new
                {
                    success = true,
                    message = "Reset solution data completed"
                });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "MyActionPage", request.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }
    }
}

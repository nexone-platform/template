using authentication_server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;
using static authentication_server.Services.EmailSettingService;

namespace authentication_server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class EmailSettingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly EmailSettingService _emailSettingService;
        public EmailSettingController(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor, EmailSettingService emailSettingService)
        {
            _context = context;
            _loggingService = loggingService;
            _emailSettingService = emailSettingService;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApiResponse<EmailSetting>>>> GetEmailTemplates()
        {
            try
            {
                var emailSetting = await _context.EmailSettings.ToListAsync();
                var response = new ApiResponse<EmailSetting>
                {
                    Data = emailSetting,
                    TotalData = emailSetting.Count
                };

                return Ok(response);
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }


        [HttpPost("update")]
        public async Task<IActionResult> UpsertEmailSetting([FromBody] EmailSettingData emailTemplate)
        {
            if (emailTemplate == null)
            {
                return BadRequest(new { message = "Invalid Email Setting data." });
            }

            try
            {
                var result = await _emailSettingService.UpsertEmailSettingAsync(emailTemplate);
                return Ok(new { message = "Email Setting saved successfully", role = result });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "UpsertEmailSetting", emailTemplate.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteEmail(int id)
        {
            var setting = await _context.EmailSettings.FindAsync(id);
            if (setting == null)
            {
                return NotFound(new { message = "Email Setting not found" });
            }

            _context.EmailSettings.Remove(setting);

            await _context.SaveChangesAsync();

            // คืนค่าผลลัพธ์การลบ
            return Ok(new { message = "Email Setting deleted successfully" });
        }
    }
}

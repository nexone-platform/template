using authentication_server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using static authentication_server.Services.EmailTemplateService;

namespace authentication_server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class EmailTemplateController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly EmailTemplateService _emailTemplateService;
        public EmailTemplateController(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor, EmailTemplateService emailTemplateService)
        {
            _context = context;
            _loggingService = loggingService;
            _emailTemplateService = emailTemplateService;
            _httpContextAccessor = httpContextAccessor;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApiResponse<EmailTemplate>>>> GetEmailTemplates()
        {
            try
            {
                var emailTemplate = await _context.EmailTemplates.ToListAsync();
                var response = new ApiResponse<EmailTemplate>
                {
                    Data = emailTemplate,
                    TotalData = emailTemplate.Count
                };

                return Ok(response);
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpPost("update")]
        public async Task<IActionResult> UpsertEmailTemplate([FromBody] EmailTemplateData emailTemplate)
        {
            if (emailTemplate == null)
            {
                return BadRequest(new { message = "Invalid role data." });
            }

            try
            {
                var result = await _emailTemplateService.UpsertEmailTemplateAsync(emailTemplate);
                return Ok(new { message = "Email Template saved successfully", role = result });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "UpsertRole", emailTemplate.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteEmail(int id)
        {
            var role = await _context.EmailTemplates.FindAsync(id);
            if (role == null)
            {
                return NotFound(new { message = "Email Templates not found" });
            }

            _context.EmailTemplates.Remove(role);

            await _context.SaveChangesAsync();

            // คืนค่าผลลัพธ์การลบ
            return Ok(new { message = "Email Templates deleted successfully" });
        }

    }
}

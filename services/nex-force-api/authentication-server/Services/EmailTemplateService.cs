using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using static authentication_server.Services.RoleService;

namespace authentication_server.Services
{
    public class EmailTemplateService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;

        public EmailTemplateService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;

        }
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        public class EmailTemplateDto : EmailTemplate
        {
            public string? Username { get; set; }
        }
        public class EmailTemplateData
        {
            public int TemplateId { get; set; }
            public string Title { get; set; }
            public string EmailContent { get; set; }
            public bool IsActive { get; set; }
            public string? TemplateCode { get; set; }
            public string Username { get; set; }
            public string? LanguageCode { get; set; }
        }

        public async Task<string> UpsertEmailTemplateAsync(EmailTemplateData emailTemplate)
        {

            if (emailTemplate.TemplateId > 0)
            {
                // Update existing role
                var emailTemplates = await _context.EmailTemplates
                    .Where(e => e.TemplateId == emailTemplate.TemplateId)
                    .FirstOrDefaultAsync();
                if (emailTemplates == null)
                {
                    throw new Exception("Email Template not found.");
                }

                emailTemplates.Title = emailTemplate.Title;
                emailTemplates.UpdateDate = DateTime.UtcNow;
                emailTemplates.UpdateBy = emailTemplate.Username;
                emailTemplates.TemplateCode = emailTemplate.TemplateCode;
                if (emailTemplates.CreateDate.HasValue)
                {
                    emailTemplates.CreateDate = emailTemplates.CreateDate.Value.ToUniversalTime();
                }
                emailTemplates.EmailContent = emailTemplate.EmailContent;
                emailTemplates.IsActive = emailTemplate.IsActive;
                emailTemplates.LanguageCode = emailTemplate.LanguageCode;
                emailTemplates.TemplateCode += emailTemplate.TemplateCode;

                _context.EmailTemplates.Update(emailTemplates);
            }
            else
            {
                int newRoleId = (await _context.EmailTemplates.MaxAsync(r => (int?)r.TemplateId) ?? 0) + 1;
                // Create new role
                var emailTemplates = new EmailTemplate
                {
                    TemplateId = newRoleId,
                    Title = emailTemplate.Title,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = emailTemplate.Username,
                    UpdateDate = DateTime.UtcNow,
                    UpdateBy = emailTemplate.Username,
                    IsActive = emailTemplate.IsActive,
                    EmailContent = emailTemplate.EmailContent,
                    TemplateCode = emailTemplate.TemplateCode,
                    LanguageCode = emailTemplate.LanguageCode,
                };

                await _context.EmailTemplates.AddAsync(emailTemplates);
            }

            await _context.SaveChangesAsync();
            return "Email Templates save successfully";
        }

    }
}

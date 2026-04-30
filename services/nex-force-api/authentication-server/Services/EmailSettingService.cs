using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;
using static authentication_server.Services.EmailTemplateService;

namespace authentication_server.Services
{
    public class EmailSettingService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;

        public EmailSettingService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
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

        public class EmailSettingeDto : EmailSetting
        {
            public string? Username { get; set; }
        }
        public class EmailSettingData
        {
            public int EmailId { get; set; }
            public bool IsEnabled { get; set; }
            public string Method { get; set; } = "SMTP";
            public string? SmtpPort { get; set; }
            public string? SmtpServer { get; set; }
            public string? SmtpLogin { get; set; }
            public string? SmtpPassword { get; set; }
            public string Username { get; set; }
            public string? FromEmail { get; set; }
            public string? ToEmail { get; set; }

            public bool IsActive { get; set; }
        }

        public async Task<string> UpsertEmailSettingAsync(EmailSettingData email)
        {

            if (email.EmailId > 0)
            {
                // Update existing role
                var emailSetting = await _context.EmailSettings
                    .Where(e => e.EmailId == email.EmailId)
                    .FirstOrDefaultAsync();
                if (emailSetting == null)
                {
                    throw new Exception("Email setting not found.");
                }

                emailSetting.IsEnabled = email.IsEnabled;
                emailSetting.Method = email.Method;
                emailSetting.SmtpServer = email.SmtpServer;
                emailSetting.SmtpLogin = email.SmtpLogin;
                emailSetting.SmtpPassword = email.SmtpPassword;
                emailSetting.FromEmail = email.FromEmail;
                emailSetting.ToEmail = email.ToEmail;
                emailSetting.IsActive = email.IsActive;
                emailSetting.CreateDate = emailSetting.CreateDate.ToUniversalTime();
                emailSetting.UpdateDate = DateTime.UtcNow;
                emailSetting.UpdateBy = email.Username;
                emailSetting.SmtpPort = email.SmtpPort;

                _context.EmailSettings.Update(emailSetting);
            }
            else
            {
                var newEmailSetting = new EmailSetting
                {
                    IsEnabled = email.IsEnabled,
                    Method = email.Method,
                    SmtpServer = email.SmtpServer,
                    SmtpLogin = email.SmtpLogin,
                    SmtpPassword = email.SmtpPassword,
                    FromEmail = email.FromEmail,
                    ToEmail = email.ToEmail,
                    IsActive = email.IsActive,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = email.Username, 
                    UpdateDate = DateTime.UtcNow,
                    SmtpPort = email.SmtpPort,
                };

                await _context.EmailSettings.AddAsync(newEmailSetting);
            }

            await _context.SaveChangesAsync();
            return "Email Setting save successfully";
        }


    }
}

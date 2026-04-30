/*using System.Net.Mail;
using System.Net;*/
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;

namespace solutionAPI.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        public EmailService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }
/*        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            try
            {
                var smtpHost = _configuration["Smtp:Host"];
                var smtpPortStr = _configuration["Smtp:Port"];
                var smtpUsername = _configuration["Smtp:Username"];
                var smtpPassword = _configuration["Smtp:Password"];
                var smtpFrom = _configuration["Smtp:SenderEmail"];

                if (string.IsNullOrEmpty(smtpHost) ||
                    string.IsNullOrEmpty(smtpPortStr) ||
                    string.IsNullOrEmpty(smtpUsername) ||
                    string.IsNullOrEmpty(smtpPassword) ||
                    string.IsNullOrEmpty(smtpFrom) ||
                    string.IsNullOrEmpty(toEmail) ||
                    string.IsNullOrEmpty(subject) ||
                    string.IsNullOrEmpty(message))
                {
                    throw new ArgumentException("One or more email parameters are null or empty.");
                }

                if (!int.TryParse(smtpPortStr, out int smtpPort))
                {
                    throw new ArgumentException("SMTP Port is not a valid integer.");
                }
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(smtpFrom),
                    Subject = subject,
                    Body = message,
                    IsBodyHtml = true,
                };

                var smtpClient = new SmtpClient(smtpHost)
                {
                    Port = smtpPort,
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                    EnableSsl = true,
                };


                mailMessage.To.Add(toEmail);

                await smtpClient.SendMailAsync(mailMessage);

            }
            catch (Exception ex)
            {
                // Log or handle the exception
                Console.WriteLine($"Exception occurred: {ex.Message}");
                throw; // Optional: rethrow the exception if needed
            }
        }*/


/*        public async Task SendEmailBySettingAsync(string toEmail, string subject, string message)
        {
            var setting = await GetActiveSettingAsync();

            if (setting == null)
                throw new Exception("No active email setting found.");

            if (string.IsNullOrWhiteSpace(toEmail) ||
                string.IsNullOrWhiteSpace(subject) ||
                string.IsNullOrWhiteSpace(message))
            {
                throw new ArgumentException("Email recipient, subject, or message is empty.");
            }

            using (var smtpClient = new SmtpClient(setting.SmtpServer)
            {
                Port = int.TryParse(setting.SmtpPort, out var port) ? port : 587,
                Credentials = new NetworkCredential(setting.SmtpLogin, setting.SmtpPassword),
                EnableSsl = true,
            })
            using (var mailMessage = new MailMessage
            {
                From = new MailAddress(setting.FromEmail),
                Subject = subject,
                Body = message,
                IsBodyHtml = true
            })
            {
                mailMessage.To.Add(toEmail);
                await smtpClient.SendMailAsync(mailMessage);
            }
        }*/

        public async Task<(string? Title, string? Content)> GetTemplateWithContentAsync(
            string templateCode,
            Dictionary<string, string> values,
            string? languageCode = null)
        {
            // พยายามหาตามภาษา (ถ้ามีส่งมา)
            var query = _context.EmailTemplates
                .Where(t => t.TemplateCode == templateCode && t.IsActive == true);

            if (!string.IsNullOrEmpty(languageCode))
            {
                query = query.Where(t => t.LanguageCode == languageCode);
            }

            var template = await query.FirstOrDefaultAsync();

            // ถ้าไม่เจอ และภาษาที่ส่งมาไม่ใช่ en → fallback เป็นภาษาอังกฤษ
            if (template == null && languageCode != "en")
            {
                template = await _context.EmailTemplates
                    .Where(t => t.TemplateCode == templateCode && t.IsActive == true && t.LanguageCode == "en")
                    .FirstOrDefaultAsync();
            }

            if (template == null)
                return (null, null);

            var content = template.EmailContent;
            foreach (var kvp in values)
            {
                content = content.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
            }

            return (template.Title, content);
        }
        public async Task<EmailSetting?> GetActiveSettingAsync()
        {
            return await _context.EmailSettings
                .Where(e => e.IsEnabled && e.IsActive)
                .OrderByDescending(e => e.EmailId)
                .FirstOrDefaultAsync();
        }

        public async Task SendEmailMailKitsAsync(string toEmail, string subject, string message)
        {
            try
            {
                var smtpHost = _configuration["Smtp:Host"];
                var smtpPortStr = _configuration["Smtp:Port"];
                var smtpUsername = _configuration["Smtp:Username"];
                var smtpPassword = _configuration["Smtp:Password"];
                var smtpFrom = _configuration["Smtp:SenderEmail"];

                if (string.IsNullOrEmpty(smtpHost) ||
                    string.IsNullOrEmpty(smtpPortStr) ||
                    string.IsNullOrEmpty(smtpUsername) ||
                    string.IsNullOrEmpty(smtpPassword) ||
                    string.IsNullOrEmpty(smtpFrom) ||
                    string.IsNullOrEmpty(toEmail) ||
                    string.IsNullOrEmpty(subject) ||
                    string.IsNullOrEmpty(message))
                {
                    throw new ArgumentException("One or more email parameters are null or empty.");
                }

                if (!int.TryParse(smtpPortStr, out int smtpPort))
                {
                    throw new ArgumentException("SMTP Port is not a valid integer.");
                }

                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(smtpFrom));
                email.To.Add(MailboxAddress.Parse(toEmail));
                email.Subject = subject;
                email.Body = new TextPart(TextFormat.Html) { Text = message };

                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(smtpUsername, smtpPassword);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"MailKit Exception: {ex.Message}");
                throw;
            }
        }

        public async Task SendEmailBySettingAsync(string toEmail, string subject, string message)
        {
            var setting = await GetActiveSettingAsync();

            if (setting == null)
                throw new Exception("No active email setting found.");

            if (string.IsNullOrWhiteSpace(toEmail) ||
                string.IsNullOrWhiteSpace(subject) ||
                string.IsNullOrWhiteSpace(message))
            {
                throw new ArgumentException("Email recipient, subject, or message is empty.");
            }

            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(setting.FromEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Html) { Text = message };

            using (var smtp = new MailKit.Net.Smtp.SmtpClient())
            {
                int port = int.TryParse(setting.SmtpPort, out var parsedPort) ? parsedPort : 587;

                await smtp.ConnectAsync(setting.SmtpServer, port, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(setting.SmtpLogin, setting.SmtpPassword);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
        }
    }
}

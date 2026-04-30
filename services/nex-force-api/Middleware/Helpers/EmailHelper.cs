using MailKit.Net.Smtp;
using MailKit.Security;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares.Models;
using MimeKit;
using MimeKit;
using MimeKit.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Helpers
{
    public static class EmailHelper
    {
        public static async Task SendEmailBySettingAsync(
          IServiceProvider services,
          string toEmail,
          string subject,
          string message)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            if (string.IsNullOrWhiteSpace(toEmail))
                throw new ArgumentException("Email recipient is empty.");
            if (string.IsNullOrWhiteSpace(subject))
                throw new ArgumentException("Email subject is empty.");
            if (string.IsNullOrWhiteSpace(message))
                throw new ArgumentException("Email message is empty.");

            var setting = await context.EmailSettings
                .Where(e => e.IsActive && e.IsEnabled)
                .OrderByDescending(e => e.EmailId)
                .FirstOrDefaultAsync();

            if (setting == null)
                throw new Exception("No active email setting found.");

            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(setting.FromEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Html) { Text = message };

            using var smtp = new SmtpClient();
            int port = int.TryParse(setting.SmtpPort, out var parsedPort) ? parsedPort : 587;

            await smtp.ConnectAsync(setting.SmtpServer, port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(setting.SmtpLogin, setting.SmtpPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
        public static async Task<(string? Title, string? Content)> GetTemplateWithContentAsync(
          IServiceProvider services,
          string templateCode,
          Dictionary<string, string> values,
          string? languageCode = null)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var query = context.EmailTemplates
                .Where(t => t.TemplateCode == templateCode && t.IsActive);

            if (!string.IsNullOrEmpty(languageCode))
                query = query.Where(t => t.LanguageCode == languageCode);

            var template = await query.FirstOrDefaultAsync();

            if (template == null && languageCode != "en")
            {
                template = await context.EmailTemplates
                    .Where(t => t.TemplateCode == templateCode && t.IsActive && t.LanguageCode == "en")
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

    }
}


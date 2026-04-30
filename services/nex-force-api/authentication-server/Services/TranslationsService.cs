using Middleware.Data;
using Middlewares.Models;
using Microsoft.EntityFrameworkCore;
using static authentication_server.Controllers.RegistationController;
using Microsoft.AspNetCore.Identity.Data;
using Middleware.Models;
using Middlewares;
using static authentication_server.Services.RoleService;
using System.Data;
using ZstdSharp.Unsafe;
namespace authentication_server.Services
{
    public class TranslationsService
    {

        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly IConfiguration _configuration;
        public TranslationsService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
        }
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public async Task<string> CreateOrUpdateAsync(LanguageTranslationDto languageTranslation)
        {
            var utcDateTime = DateTime.UtcNow;

            if (languageTranslation.TranslationsId > 0)
            {

                var existing = await _context.LanguageTranslations
                    .FirstOrDefaultAsync(e => e.TranslationsId == languageTranslation.TranslationsId);

                if (existing == null)
                {
                    throw new KeyNotFoundException($"Label key with ID {languageTranslation.TranslationsId} not found.");
                }

                existing.UpdateBy = languageTranslation.Username;
                existing.UpdateDate = utcDateTime;
                existing.CreateDate = existing.CreateDate.Value.ToUniversalTime();
                existing.PageKey = languageTranslation.PageKey;
                existing.LabelValue = languageTranslation.LabelValue;
                existing.LabelKey = languageTranslation.LabelKey;
                existing.LanguageCode = languageTranslation.LanguageCode;

                _context.LanguageTranslations.Update(existing);
            } else
            {
                var newTranslation = new LanguageTranslation
                {
                    CreateDate = utcDateTime,
                    UpdateDate = utcDateTime,
                    CreateBy = languageTranslation.Username,
                    UpdateBy = languageTranslation.Username,
                    PageKey = languageTranslation.PageKey,
                    LabelValue = languageTranslation.LabelValue,
                    LabelKey = languageTranslation.LabelKey,
                    LanguageCode = languageTranslation.LanguageCode
                };
                _context.LanguageTranslations.Add(newTranslation);
            }

            await _context.SaveChangesAsync();


            return "Label key saved successfully.";
        }

        public class LanguageTranslationDto
        {
            public int TranslationsId { get; set; }
            public string LanguageCode { get; set; }
            public string PageKey { get; set; }
            public string LabelKey { get; set; }
            public string LabelValue { get; set; }
            public string? UpdateBy { get; set; }
            public string? Username { get; set; }
        }

        public class TranslationSearchDto
        {
            public string? LanguageCode { get; set; }
            public string? PageKey { get; set; }
            public string? LabelKey { get; set; }
            public string? LabelValue { get; set; }
        }

        public class LanguageDto
        {
            public int LanguagesId { get; set; }
            public string LanguageCode { get; set; }
            public string LanguageName { get; set; }
            public string? Description { get; set; }
        }
    }
}

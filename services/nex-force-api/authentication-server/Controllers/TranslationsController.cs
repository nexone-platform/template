using authentication_server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using static authentication_server.Services.TranslationsService;
namespace authentication_server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TranslationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly TranslationsService _translationsService;
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        public TranslationsController(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor, TranslationsService translationsService)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;
            _translationsService = translationsService;
        }

        [HttpGet("{languageCode}/{pageKey}")]
        public async Task<IActionResult> GetTranslations(string languageCode, string pageKey)
        {
            var translations = await _context.LanguageTranslations
                  .Where(t => t.LanguageCode == languageCode && t.PageKey == pageKey)
                  .GroupBy(t => t.LabelKey)
                  .ToDictionaryAsync(
                      g => g.Key,
                      g => g.First().LabelValue
                  );

            return Ok(translations);
        }

        [HttpPost("labelList")]
        public async Task<ActionResult<ApiResponse<LanguageTranslation>>> GetAll([FromBody] TranslationSearchDto search)
        {
            var query = _context.LanguageTranslations.AsQueryable();

            if (!string.IsNullOrEmpty(search.LanguageCode))
                query = query.Where(x => x.LanguageCode == search.LanguageCode);

            if (!string.IsNullOrEmpty(search.PageKey))
                query = query.Where(x => x.PageKey == search.PageKey);

            if (!string.IsNullOrEmpty(search.LabelKey))
                query = query.Where(x => x.LabelKey == search.LabelKey);

            if (!string.IsNullOrEmpty(search.LabelValue))
                query = query.Where(x => x.LabelValue.Contains(search.LabelValue));

            query = query.OrderBy(x => x.PageKey);

            var data = await query.ToListAsync();

            var response = new ApiResponse<LanguageTranslation>
            {
                Data = data,
                TotalData = data.Count
            };

            return Ok(response);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteTax(int id)
        {
            var label = await _context.LanguageTranslations.FindAsync(id);
            if (label == null)
            {
                return NotFound(new { message = "Label Translation not found" });
            }
            _context.LanguageTranslations.Remove(label);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Label Translation deleted successfully" });
        }

        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdatePromotion([FromBody] LanguageTranslationDto languageTranslationDto)
        {
            if (languageTranslationDto == null)
            {
                return BadRequest(new { message = "Invalid Language Translation data." });
            }

            try
            {
                var result = await _translationsService.CreateOrUpdateAsync(languageTranslationDto);
                return Ok(new { message = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "update-SaveLanguageTranslation", languageTranslationDto.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpPost("getLanguages")]
        public async Task<IActionResult> GetLanguages()
        {
            var data = await _context.Languages
                .OrderBy(l => l.LanguageCode)
                .ToListAsync();

            var response = new ApiResponse<Language>
            {
                Data = data,
                TotalData = data.Count
            };

            return Ok(response);
        }


        [HttpPost("getPageKey")]
        public async Task<IActionResult> GetPageKey()
        {
            var data = await _context.LanguageTranslations
                .AsNoTracking() // ป้องกัน EF tracking ซ้ำ
                .OrderBy(l => l.PageKey)
                .ToListAsync();

            var distinctData = data
                .GroupBy(l => l.PageKey)
                .Select(g => g.First())
                .ToList();

            var response = new ApiResponse<LanguageTranslation>
            {
                Data = distinctData,
                TotalData = distinctData.Count
            };

            return Ok(response);
        }

    }
}

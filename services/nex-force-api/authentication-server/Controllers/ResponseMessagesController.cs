using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;

namespace authentication_server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ResponseMessagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILoggingService _loggingService;

        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        public class MessageSearchDto
        {
            public string? LanguageCode { get; set; }
            public string? Category { get; set; }
            public string? MessageKey { get; set; }
        }

        public class ResponseMessageDto
        {
            public int MessageId { get; set; }
            public string LanguageCode { get; set; }
            public string MessageKey { get; set; }
            public string Category { get; set; }
            public string Title { get; set; }
            public string Message { get; set; }
            public bool IsActive { get; set; }
            public string? Username { get; set; }
        }

        public ResponseMessagesController(ApplicationDbContext context, ILoggingService loggingService)
        {
            _context = context;
            _loggingService = loggingService;
        }

        /// <summary>
        /// Get all messages for a specific language (used by frontend to batch-load)
        /// </summary>
        [HttpPost("list")]
        public async Task<ActionResult<ApiResponse<ResponseMessage>>> GetAll([FromBody] MessageSearchDto search)
        {
            var query = _context.ResponseMessages
                .Where(x => x.IsActive)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search.LanguageCode))
                query = query.Where(x => x.LanguageCode == search.LanguageCode);

            if (!string.IsNullOrEmpty(search.Category))
                query = query.Where(x => x.Category == search.Category);

            if (!string.IsNullOrEmpty(search.MessageKey))
                query = query.Where(x => x.MessageKey.Contains(search.MessageKey));

            query = query.OrderBy(x => x.Category).ThenBy(x => x.MessageKey);

            var data = await query.ToListAsync();

            return Ok(new ApiResponse<ResponseMessage>
            {
                Data = data,
                TotalData = data.Count
            });
        }

        /// <summary>
        /// Get all messages (including inactive) for admin management
        /// </summary>
        [HttpPost("adminList")]
        public async Task<ActionResult<ApiResponse<ResponseMessage>>> GetAdminList([FromBody] MessageSearchDto search)
        {
            var query = _context.ResponseMessages.AsQueryable();

            if (!string.IsNullOrEmpty(search.LanguageCode))
                query = query.Where(x => x.LanguageCode == search.LanguageCode);

            if (!string.IsNullOrEmpty(search.Category))
                query = query.Where(x => x.Category == search.Category);

            if (!string.IsNullOrEmpty(search.MessageKey))
                query = query.Where(x => x.MessageKey.Contains(search.MessageKey));

            query = query.OrderBy(x => x.Category).ThenBy(x => x.MessageKey).ThenBy(x => x.LanguageCode);

            var data = await query.ToListAsync();

            return Ok(new ApiResponse<ResponseMessage>
            {
                Data = data,
                TotalData = data.Count
            });
        }

        /// <summary>
        /// Create or update a response message
        /// </summary>
        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdate([FromBody] ResponseMessageDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid data." });

            try
            {
                if (dto.MessageId > 0)
                {
                    // Update
                    var existing = await _context.ResponseMessages.FindAsync(dto.MessageId);
                    if (existing == null)
                        return NotFound(new { message = "Message not found" });

                    existing.LanguageCode = dto.LanguageCode;
                    existing.MessageKey = dto.MessageKey;
                    existing.Category = dto.Category;
                    existing.Title = dto.Title;
                    existing.Message = dto.Message;
                    existing.IsActive = dto.IsActive;
                    existing.UpdateDate = DateTime.UtcNow;
                    existing.UpdateBy = dto.Username;
                }
                else
                {
                    // Create
                    var newMsg = new ResponseMessage
                    {
                        LanguageCode = dto.LanguageCode,
                        MessageKey = dto.MessageKey,
                        Category = dto.Category,
                        Title = dto.Title,
                        Message = dto.Message,
                        IsActive = dto.IsActive,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = dto.Username
                    };
                    _context.ResponseMessages.Add(newMsg);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Response message saved successfully" });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "ResponseMessages-CreateOrUpdate", dto.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        /// <summary>
        /// Delete a response message
        /// </summary>
        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var msg = await _context.ResponseMessages.FindAsync(id);
            if (msg == null)
                return NotFound(new { message = "Message not found" });

            _context.ResponseMessages.Remove(msg);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Response message deleted successfully" });
        }

        /// <summary>
        /// Get distinct categories
        /// </summary>
        [HttpPost("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.ResponseMessages
                .Select(x => x.Category)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();

            return Ok(new { data = categories });
        }

        /// <summary>
        /// Get distinct message keys (for reference)
        /// </summary>
        [HttpPost("keys")]
        public async Task<IActionResult> GetKeys()
        {
            var keys = await _context.ResponseMessages
                .Select(x => x.MessageKey)
                .Distinct()
                .OrderBy(x => x)
                .ToListAsync();

            return Ok(new { data = keys });
        }
    }
}

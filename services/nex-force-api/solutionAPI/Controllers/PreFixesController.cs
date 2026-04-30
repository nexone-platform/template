using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using System.Linq;
using System.Security.Claims;
using static solutionAPI.Controllers.DesignationsController;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PreFixesController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public PreFixesController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }
        [HttpGet("getAllPrefixes")]
        public async Task<ActionResult<IEnumerable<Prefixes>>> GetAllPrefixes()
        {
            var prefixes = await _context.Prefixes.ToListAsync();
            var response = new ApiResponse<Prefixes>
            {
                Data = prefixes,
                TotalData = prefixes.Count
            };
            return Ok(response);
        }

        [HttpPost("update")]
        public async Task<ActionResult<IEnumerable<Prefixes>>> CreateOrUpdatePrefixes([FromBody] Prefixes prefixes)
        {

            if (prefixes == null)
            {
                return BadRequest(new { message = "Invalid document running data." });
            }
            if (prefixes.PrefixId > 0 )
            {  // Update existing 
                var existingDocument = await _context.Prefixes
                    .FirstOrDefaultAsync(e => e.PrefixId == prefixes.PrefixId);
                if (existingDocument == null)
                {
                    return NotFound(new { message = $"Document Runing with ID {prefixes.PrefixId} not found." });
                }

                existingDocument.UpdateBy = GetCurrentUserId();
                existingDocument.UpdateDate = DateTime.UtcNow;
                existingDocument.PrefixKey = prefixes.PrefixKey;
                existingDocument.PrefixLabel = prefixes.PrefixLabel;
                existingDocument.PrefixValue = prefixes.PrefixValue;
                existingDocument.SeqShow = prefixes.SeqShow;
                existingDocument.CreateDate = existingDocument.CreateDate;
                existingDocument.CreateBy = existingDocument.CreateBy;

                _context.Prefixes.Update(existingDocument);
            } else
            {
                var maxId = await _context.Prefixes
                            .MaxAsync(e => (int?)e.PrefixId);
                if (maxId == null)
                {
                    // Handle the case where the table is empty
                    maxId = 1;
                }
                else
                {
                    maxId = maxId + 1;
                }
       
                var newDocument = new Prefixes
                {
                    PrefixId = (int)maxId,
                    PrefixKey = prefixes.PrefixKey,
                    PrefixLabel = prefixes.PrefixLabel,
                    PrefixValue = prefixes.PrefixValue,
                    SeqShow = prefixes.SeqShow,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = GetCurrentUserId()
                };

                _context.Prefixes.Add(newDocument);
            }
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Document running saved successfully." });
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteDocumentRuning(int id)
        {
            // Find the holiday by its ID
            var document = await _context.Prefixes.FindAsync(id);
            if (document == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "Document Running not found" });
            }

            // Remove the holiday from the database
            _context.Prefixes.Remove(document);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "Document running deleted successfully." });
        }

        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            return username;
        }

    }
}

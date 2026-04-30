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
    public class DocumentRunningController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public DocumentRunningController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }
        [HttpGet("getAllDocument")]
        public async Task<ActionResult<IEnumerable<DocumentRunning>>> GetAllDocument()
        {
            var documentRunnings = await _context.DocumentRunning.ToListAsync();
            var response = new ApiResponse<DocumentRunning>
            {
                Data = documentRunnings,
                TotalData = documentRunnings.Count
            };
            return Ok(response);
        }

        [HttpPost("update")]
        public async Task<ActionResult<IEnumerable<DocumentRunning>>> CreateOrUpdateDocumentRunning([FromBody] DocumentRunning documentRunning)
        {

            if (documentRunning == null)
            {
                return BadRequest(new { message = "Invalid document running data." });
            }
            if (documentRunning.DocumentId > 0 )
            {  // Update existing 
                var existingDocument = await _context.DocumentRunning
                    .FirstOrDefaultAsync(e => e.DocumentId == documentRunning.DocumentId);
                if (existingDocument == null)
                {
                    return NotFound(new { message = $"Document Runing with ID {documentRunning.DocumentId} not found." });
                }

                existingDocument.UpdateBy = GetCurrentUserId();
                existingDocument.UpdateDate = DateTime.UtcNow;
                existingDocument.DocumentType = documentRunning.DocumentType;
                existingDocument.Description = documentRunning.Description;
                existingDocument.FormatDate = documentRunning.FormatDate;
                existingDocument.Prefix = documentRunning.Prefix;
                existingDocument.Suffix = documentRunning.Suffix;
                existingDocument.CreateDate = existingDocument.CreateDate;
                existingDocument.DigitNumber = documentRunning.DigitNumber;
                existingDocument.CreateBy = existingDocument.CreateBy;
                existingDocument.Running = documentRunning.Running;

                _context.DocumentRunning.Update(existingDocument);
            } else
            {
                var maxId = await _context.DocumentRunning
                            .MaxAsync(e => (int?)e.DocumentId);
                if (maxId == null)
                {
                    // Handle the case where the table is empty
                    maxId = 1;
                }
                else
                {
                    maxId = maxId + 1;
                }
       
                var newDocument = new DocumentRunning
                {
                    DocumentId = (int)maxId,
                    DocumentType = documentRunning.DocumentType,
                    Description = documentRunning.Description,
                    Prefix = documentRunning.Prefix,
                    Suffix = documentRunning.Suffix,
                    DigitNumber = documentRunning.DigitNumber,
                    FormatDate = documentRunning.FormatDate,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = GetCurrentUserId()
                };

                _context.DocumentRunning.Add(newDocument);
            }
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Document running saved successfully." });
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteDocumentRuning(int id)
        {
            // Find the holiday by its ID
            var document = await _context.DocumentRunning.FindAsync(id);
            if (document == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "Document Running not found" });
            }

            // Remove the holiday from the database
            _context.DocumentRunning.Remove(document);

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


using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using performance_server.Service;
using static performance_server.Service.PromotionService;

namespace performance_server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class PromotionController : ControllerBase
    {
        private readonly PromotionService _promotionService;
        private readonly ILoggingService _loggingService;
        private readonly ApplicationDbContext _context;
        public PromotionController(PromotionService promotionService, ILoggingService loggingService, ApplicationDbContext context)
        {
            _promotionService = promotionService;
            _loggingService = loggingService;
            _context = context;
        }
        [HttpGet()]
        public async Task<IActionResult> GetEmployments()
        {
            try
            {
                var response = await _promotionService.GetPromotionsAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }
        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdatePromotion([FromBody] UpdatePromotionDto promotion)
        {
            if (promotion == null)
            {
                return BadRequest(new { message = "Invalid promotion data." });
            }

            try
            {
                await _promotionService.CreateOrUpdatePromotion(promotion);
                return Ok(new { message = "Promotion saved successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> UpdatePromotionStatus(decimal id, [FromBody] ApproveRequest request)
        {
            var currentUser = request.Username; // Get the current user
            try
            {
                var result = await _promotionService.UpdatePromotionStatusAsync(id, request, currentUser);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "update-promotion-status", currentUser);
                return StatusCode(500, new { message = "An error occurred while updating the promotion status." });
            }
        }
        [HttpGet("pendingApprovalCount")]
        public async Task<ActionResult<int>> GetPendingApprovalCountAsync()
        {
            try
            {
                // Count the number of pending requests
                var pendingCount = await _promotionService.GetPendingApprovalCountInternalAsync();

                // Return the count
                return Ok(pendingCount);
            }
            catch (Exception ex)
            {
                // Handle errors gracefully
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetPromotionById(int id)
        {
            var overtime = await _context.Promotions
                .FirstOrDefaultAsync(o => o.PromotionId == id);

            if (overtime == null)
                return NotFound(new { message = $"Promotions request {id} not found." });

            return Ok(overtime);
        }
    }

}

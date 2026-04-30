using AutoMapper;
using HrService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;
using static HrService.Services.TaxService;
namespace HrService.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TaxController : ControllerBase
    {
        private readonly TaxService _taxService;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILoggingService _loggingService;
        public TaxController(ApplicationDbContext context, IMapper mapper, TaxService taxService, ILoggingService loggingService)
        {
            _mapper = mapper;
            _context = context;
            _taxService = taxService;
            _loggingService = loggingService;
        }

        [HttpGet("getType")]
        public async Task<ActionResult<IEnumerable<ApiResponse<TaxDeductionType>>>> GetTerminateTypes()
        {
            try
            {
                var leaveTypes = await _context.TaxDeductionTypes.ToListAsync();
                var response = new ApiResponse<TaxDeductionType>
                {
                    Data = leaveTypes,
                    TotalData = leaveTypes.Count
                };
                return Ok(response);

            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }

        }

        [HttpGet("getIncomeTaxBracket")]
        public async Task<ActionResult<IEnumerable<ApiResponse<IncomeTaxBracket>>>> GetIncomeTaxBracket()
        {
            try
            {
                var leaveTypes = await _context.IncomeTaxBrackets.ToListAsync();
                var response = new ApiResponse<IncomeTaxBracket>
                {
                    Data = leaveTypes,
                    TotalData = leaveTypes.Count
                };
                return Ok(response);

            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }

        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApiResponse<TaxDeductionDto>>>> GetTerminate()
        {
            try
            {
                var response = await _taxService.GetTaxDeductionsAsync();

                return Ok(response);

            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }

        }

        [HttpPost("taxType/save")]
        public async Task<IActionResult> SaveTerminateType([FromBody] TaxDeductionTypeDto terminateTypeDto)
        {
            if (terminateTypeDto == null)
            {
                return BadRequest(new { message = "Invalid tax deduction type data." });
            }

            try
            {
                var result = await _taxService.CreateOrUpdateTaxDeductionTypeAsync(terminateTypeDto);
                return Ok(new { message = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred." });
            }
        }

        [HttpPost("incomeTaxBracket/save")]
        public async Task<IActionResult> SaveIncomeTaxBracketId([FromBody] IncomeTaxBracketDTO incomeTaxBracketDto)
        {
            if (incomeTaxBracketDto == null)
            {
                return BadRequest(new { message = "Invalid tax deduction type data." });
            }

            try
            {
                var result = await _taxService.SaveIncomeTaxBracketAsync(incomeTaxBracketDto);
                return Ok(new { message = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "update-SaveTaxDeductionAsync", incomeTaxBracketDto.Username);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred." }); 
            }
        }

        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdatePromotion([FromBody] TaxDeductionDTO terminateDto)
        {
            if (terminateDto == null)
            {
                return BadRequest(new { message = "Invalid tax data." });
            }

            try
            {
                var result = await _taxService.SaveTaxDeductionAsync(terminateDto);
                return Ok(new { message = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "update-SaveTaxDeductionAsync", terminateDto.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpDelete("deleteType")]
        public async Task<IActionResult> DeleteTaxType(int id)
        {
            // Find the holiday by its ID
            var holiday = await _context.TaxDeductionTypes.FindAsync(id);
            if (holiday == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "Tax Type not found" });
            }

            // Remove the holiday from the database
            _context.TaxDeductionTypes.Remove(holiday);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "Tax Type deleted successfully" });
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteTax(int id)
        {
            // Find the holiday by its ID
            var holiday = await _context.TaxDeductions.FindAsync(id);
            if (holiday == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "Tax not found" });
            }

            // Remove the holiday from the database
            _context.TaxDeductions.Remove(holiday);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "Tax deleted successfully" });
        }
        [HttpDelete("deleteIncome")]
        public async Task<IActionResult> DeleteIncome(int id)
        {
            // Find the holiday by its ID
            var holiday = await _context.IncomeTaxBrackets.FindAsync(id);
            if (holiday == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "Income Tax Brackets not found" });
            }

            // Remove the holiday from the database
            _context.IncomeTaxBrackets.Remove(holiday);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "Income Tax Brackets successfully" });
        }

    }
}

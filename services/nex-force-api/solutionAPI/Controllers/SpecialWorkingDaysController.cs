using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using System.Linq;
using System.Security.Claims;


namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SpecialWorkingDaysController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public class SpecialWorkingDaysDto : SpecialWorkingDays
        {
            public string? OrganizationNameTh { get; set; }
            public string? OrganizationNameEn { get; set; }
        }
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILoggingService _loggingService;
        public SpecialWorkingDaysController(ApplicationDbContext context, IMapper mapper, ILoggingService loggingService)
        {
            _mapper = mapper;
            _context = context;
            _loggingService = loggingService;
        }
        [HttpGet("getAllSpecialDay")]
        public async Task<ActionResult<IEnumerable<SpecialWorkingDaysDto>>> GetAllHoliday()
        {
            var holidays = await (
                from e in _context.SpecialWorkingDays
                join org in _context.Organizations on e.OrganizationCode equals org.OrganizationCode into orgGroup
                from org in orgGroup.DefaultIfEmpty() // Left join with Organizations
                join client in _context.Clients on e.OrganizationCode equals client.ClientCode into clientGroup
                from client in clientGroup.DefaultIfEmpty() // Left join with Clients
                select new SpecialWorkingDaysDto
                {
                    SpecialDaysId = e.SpecialDaysId,
                    SpecialDate = e.SpecialDate,
                    Day = e.Day,
                    TitleEn = e.TitleEn,
                    TitleTh = e.TitleTh,
                    OrganizationCode = e.OrganizationCode,
                    OrganizationNameEn = org != null ? org.OrganizationNameEn : (client != null ? client.Company : null),
                    //OrganizationNameTh = org != null ? org.OrganizationNameTh : (client != null ? client.ClientNameTh : null),
                    IsAnnual = e.IsAnnual,
                    CreateDate = e.CreateDate,
                    CreateBy = e.CreateBy,
                    UpdateDate = e.UpdateDate,
                    UpdateBy = e.UpdateBy,
                }
            ).ToListAsync();
            var response = new ApiResponse<SpecialWorkingDaysDto>
            {
                Data = holidays,
                TotalData = holidays.Count
            };
            return Ok(response);
        }
        [HttpPost("update")]
        public async Task<ActionResult<IEnumerable<SpecialWorkingDays>>> CreateOrUpdateEmployee([FromBody] SpecialWorkingDays holiday)
        {

            if (holiday == null)
            {
                return BadRequest(new { message = "Invalid Special working days data." });
            }
            if (holiday.SpecialDaysId > 0)
            {  // Update existing 
                var existingHolidays = await _context.SpecialWorkingDays
                    .FirstOrDefaultAsync(e => e.SpecialDaysId == holiday.SpecialDaysId);
                if (existingHolidays == null)
                {
                    return NotFound(new { message = $"Special working days with ID {holiday.SpecialDaysId} not found." });
                }

                existingHolidays.UpdateBy = GetCurrentUserId();
                existingHolidays.UpdateDate = DateTime.UtcNow;
                existingHolidays.TitleTh = holiday.TitleTh;
                existingHolidays.TitleEn = holiday.TitleEn;
                existingHolidays.SpecialDate = holiday.SpecialDate.ToUniversalTime();
                existingHolidays.Day = holiday.Day;
                existingHolidays.IsActive = holiday.IsActive;
                existingHolidays.IsAnnual = holiday.IsAnnual;
                existingHolidays.CreateDate = holiday.CreateDate;
                existingHolidays.OrganizationCode = holiday.OrganizationCode;
                existingHolidays.CreateBy = holiday.CreateBy;

                _context.SpecialWorkingDays.Update(existingHolidays);
            }
            else
            {
                var maxId = await _context.SpecialWorkingDays
                            .MaxAsync(e => (int?)e.SpecialDaysId);
                if (maxId == null)
                {
                    // Handle the case where the table is empty
                    maxId = 1;
                }
                else
                {
                    maxId = maxId + 1;
                }

                var newHoliday = new SpecialWorkingDays
                {
                    SpecialDaysId = (int)maxId,
                    TitleEn = holiday.TitleEn,
                    TitleTh = holiday.TitleTh,
                    Day = holiday.Day,
                    IsActive = true,
                    IsAnnual = holiday.IsAnnual,
                    SpecialDate = holiday.SpecialDate.ToUniversalTime(),
                    CreateDate = DateTime.UtcNow,
                    OrganizationCode = holiday.OrganizationCode,
                    CreateBy = GetCurrentUserId(), // Use a method to get the current user's ID
                };

                _context.SpecialWorkingDays.Add(newHoliday);
            }
            await _context.SaveChangesAsync();

            return Ok(new { message = "Special working days save successfully" });
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var holiday = await _context.SpecialWorkingDays.FindAsync(id);
            if (holiday == null)
            {
                return NotFound(new { message = "Special working days not found" });
            }
            _context.SpecialWorkingDays.Remove(holiday);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Special working days deleted successfully" });
        }

/*        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<SpecialWorkingDaysDto>>> GetDataAsync([FromBody] Criteria criteria)
        {
            try
            {
                // Build the query
                var query = from e in _context.SpecialWorkingDays
                            join org in _context.Organizations on e.OrganizationCode equals org.OrganizationCode into orgGroup
                            from org in orgGroup.DefaultIfEmpty() // Left join with Organizations
                            join client in _context.Clients on e.OrganizationCode equals client.ClientCode into clientGroup
                            from client in clientGroup.DefaultIfEmpty() // Left join with Clients
                            select new SpecialWorkingDaysDto
                            {
                                SpecialDate = e.SpecialDate,
                                SpecialDaysId = e.SpecialDaysId,
                                Day = e.Day,
                                TitleEn = e.TitleEn,
                                TitleTh = e.TitleTh,
                                OrganizationCode = e.OrganizationCode,
                                OrganizationNameEn = org != null ? org.OrganizationNameEn : (client != null ? client.Company : null),
                                OrganizationNameTh = org != null ? org.OrganizationNameTh : (client != null ? client.ClientNameTh : null),
                                IsAnnual = e.IsAnnual,
                                CreateDate = e.CreateDate,
                                CreateBy = e.CreateBy,
                                UpdateDate = e.UpdateDate,
                                UpdateBy = e.UpdateBy,
                            };

                // Apply filtering
                if (!string.IsNullOrEmpty(criteria.Year))
                {
                    if (int.TryParse(criteria.Year, out int year))
                    {
                        query = query.Where(e => e.SpecialDate.Year == year);
                    }
                }

                if (!string.IsNullOrEmpty(criteria.Title))
                {
                    query = query.Where(e => e.TitleEn.Contains(criteria.Title) || e.TitleTh.Contains(criteria.Title));
                }

                if (!string.IsNullOrEmpty(criteria.OrganizationCode))
                {
                    query = query.Where(e => e.OrganizationCode == criteria.OrganizationCode);
                }

                if (criteria.IsAnnual.HasValue)
                {
                    query = query.Where(e => e.IsAnnual == criteria.IsAnnual);
                }

                var totalData = await query.CountAsync();

                var holidays = await query.ToListAsync();

                var response = new ApiResponse<SpecialWorkingDaysDto>
                {
                    Data = holidays,
                    TotalData = totalData
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "solutionAPI.Controllers.SpecialWorkingDaysController.GetHolidaysAsync ", "Username");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        } *//*        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<SpecialWorkingDaysDto>>> GetDataAsync([FromBody] Criteria criteria)
        {
            try
            {
                // Build the query
                var query = from e in _context.SpecialWorkingDays
                            join org in _context.Organizations on e.OrganizationCode equals org.OrganizationCode into orgGroup
                            from org in orgGroup.DefaultIfEmpty() // Left join with Organizations
                            join client in _context.Clients on e.OrganizationCode equals client.ClientCode into clientGroup
                            from client in clientGroup.DefaultIfEmpty() // Left join with Clients
                            select new SpecialWorkingDaysDto
                            {
                                SpecialDate = e.SpecialDate,
                                SpecialDaysId = e.SpecialDaysId,
                                Day = e.Day,
                                TitleEn = e.TitleEn,
                                TitleTh = e.TitleTh,
                                OrganizationCode = e.OrganizationCode,
                                OrganizationNameEn = org != null ? org.OrganizationNameEn : (client != null ? client.Company : null),
                                OrganizationNameTh = org != null ? org.OrganizationNameTh : (client != null ? client.ClientNameTh : null),
                                IsAnnual = e.IsAnnual,
                                CreateDate = e.CreateDate,
                                CreateBy = e.CreateBy,
                                UpdateDate = e.UpdateDate,
                                UpdateBy = e.UpdateBy,
                            };

                // Apply filtering
                if (!string.IsNullOrEmpty(criteria.Year))
                {
                    if (int.TryParse(criteria.Year, out int year))
                    {
                        query = query.Where(e => e.SpecialDate.Year == year);
                    }
                }

                if (!string.IsNullOrEmpty(criteria.Title))
                {
                    query = query.Where(e => e.TitleEn.Contains(criteria.Title) || e.TitleTh.Contains(criteria.Title));
                }

                if (!string.IsNullOrEmpty(criteria.OrganizationCode))
                {
                    query = query.Where(e => e.OrganizationCode == criteria.OrganizationCode);
                }

                if (criteria.IsAnnual.HasValue)
                {
                    query = query.Where(e => e.IsAnnual == criteria.IsAnnual);
                }

                var totalData = await query.CountAsync();

                var holidays = await query.ToListAsync();

                var response = new ApiResponse<SpecialWorkingDaysDto>
                {
                    Data = holidays,
                    TotalData = totalData
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "solutionAPI.Controllers.SpecialWorkingDaysController.GetHolidaysAsync ", "Username");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        } */

        [HttpPost("copy")]
        public async Task<IActionResult> CopyHolidays([FromBody] SpecialWorkingDaysCopyRequest request)
        {
            if (request.Special == null || request.Special.Count == 0)
            {
                return BadRequest(new { message = "Invalid data." });
            }
            var maxId = await _context.SpecialWorkingDays
                            .MaxAsync(e => (int?)e.SpecialDaysId);
            if (maxId == null)
            {
                // Handle the case where the table is empty
                maxId = 0;
            }
            foreach (var holiday in request.Special)
            {
                maxId = maxId + 1;
                // Create a new holiday entity and update its date to the destination year
                var newHoliday = new SpecialWorkingDays
                {
                    SpecialDaysId = (int)maxId,
                    TitleTh = holiday.TitleTh,
                    TitleEn = holiday.TitleEn,
                    SpecialDate = holiday.SpecialDate, // Date is already updated to the destination year on the frontend
                    OrganizationCode = holiday.OrganizationCode,
                    Day = holiday.SpecialDate.DayOfWeek.ToString(),
                    IsActive = holiday.IsActive,
                    IsAnnual = holiday.IsAnnual,
                    CreateBy = GetCurrentUserId(),
                    CreateDate = DateTime.UtcNow,
                };

                _context.SpecialWorkingDays.Add(newHoliday);
            }

            await _context.SaveChangesAsync(); // Save changes to the database

            return Ok(new { message = "Special Working Days copied to the year " + request.DestinationYear });
        }

        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            // Example using HttpContext
            /* var userId = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);*/

            return username;
        }
        public class Criteria
        {
            public string? Year { get; set; }
            public string? Title { get; set; }
            public string? OrganizationCode { get; set; }
            public bool? IsAnnual { get; set; }
        }

        public class SpecialWorkingDaysCopyRequest
        {
            public List<SpecialWorkingDaysDTO>? Special { get; set; }
            public int DestinationYear { get; set; }
        }

        public class SpecialWorkingDaysDTO
        {
            public string? TitleTh { get; set; }
            public string? TitleEn { get; set; }
            public DateTime SpecialDate { get; set; }
            public string? OrganizationNameTh { get; set; }
            public string? OrganizationNameEn { get; set; }
            public int? OrganizationId { get; set; }
            public bool IsAnnual { get; set; }
            public string? OrganizationCode { get; set; }
            public bool IsActive { get; set; }
            
        }
    }
}

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
    public class HolidayController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public class HolidayDTO : Holiday
        {
            public string? OrganizationNameTh { get; set; }
            public string? OrganizationNameEn { get; set; }
        }
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public HolidayController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }
        [HttpGet("getAllHoliday")]
        public async Task<ActionResult<IEnumerable<HolidayDTO>>> GetAllHoliday()
        {
            var holidays = await (
                from e in _context.Holidays
                join org in _context.Organizations on e.OrganizationCode equals org.OrganizationCode into orgGroup
                from org in orgGroup.DefaultIfEmpty() // Left join with Organizations
                join client in _context.Clients on e.OrganizationCode equals client.ClientCode into clientGroup
                from client in clientGroup.DefaultIfEmpty() // Left join with Clients
                orderby e.HolidayDate
                select new HolidayDTO
                {
                    HolidayId = e.HolidayId,
                    HolidayDate = e.HolidayDate,
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
            var response = new ApiResponse<HolidayDTO>
            {
                Data = holidays,
                TotalData = holidays.Count
            };
            return Ok(response);
        }
        public class HolidayData
        {

            public int? HolidayId { get; set; }
            public string? TitleTh { get; set; }
            public string? TitleEn { get; set; }
            public DateTime HolidayDate { get; set; }

            public string? Day { get; set; }
            public bool IsAnnual { get; set; }

            public bool IsActive { get; set; }

            public string? Username { get; set; }
            public string? OrganizationCode { get; set; } 
        }

        [HttpPost("update")]
        public async Task<ActionResult<IEnumerable<Holiday>>> CreateOrUpdateEmployee([FromBody] HolidayData holiday)
        {

            if (holiday == null)
            {
                return BadRequest(new { message = "Invalid holiday data." });
            }
            if (holiday.HolidayId > 0 )
            {  // Update existing 
                var existingHolidays = await _context.Holidays
                    .FirstOrDefaultAsync(e => e.HolidayId == holiday.HolidayId);
                if (existingHolidays == null)
                {
                    return NotFound(new { message = $"Holiday with ID {holiday.HolidayId} not found." });
                }

                existingHolidays.UpdateBy = holiday.Username;
                existingHolidays.UpdateDate = DateTime.UtcNow;
                existingHolidays.TitleTh = holiday.TitleTh;
                existingHolidays.TitleEn = holiday.TitleEn;
                existingHolidays.HolidayDate = holiday.HolidayDate.ToUniversalTime();
                existingHolidays.Day = holiday.Day;
                existingHolidays.IsAnnual = holiday.IsAnnual;
                existingHolidays.CreateDate = existingHolidays.CreateDate;
                existingHolidays.OrganizationCode = holiday.OrganizationCode;
                existingHolidays.CreateBy = existingHolidays.CreateBy;
                existingHolidays.IsActive = holiday.IsActive;

                _context.Holidays.Update(existingHolidays);
            } else
            {
                var maxId = await _context.Holidays
                            .MaxAsync(e => (int?)e.HolidayId);
                if (maxId == null)
                {
                    // Handle the case where the table is empty
                    maxId = 1;
                }
                else
                {
                    maxId = maxId + 1;
                }
       
                var newHoliday = new Holiday
                {
                    HolidayId = (int)maxId,
                    TitleEn = holiday.TitleEn,
                    TitleTh = holiday.TitleTh,
                    Day = holiday.Day,
                    IsActive = holiday.IsActive,
                    IsAnnual = holiday.IsAnnual,
                    HolidayDate = holiday.HolidayDate,
                    CreateDate = DateTime.UtcNow,
                    OrganizationCode = holiday.OrganizationCode,
                    CreateBy = holiday.Username,
                };

                _context.Holidays.Add(newHoliday);
            }
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Holiday save successfully" });
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteHoliday(int id)
        {
            // Find the holiday by its ID
            var holiday = await _context.Holidays.FindAsync(id);
            if (holiday == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "Holiday not found" });
            }

            // Remove the holiday from the database
            _context.Holidays.Remove(holiday);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "Holiday deleted successfully" });
        }

        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<HolidayDTO>>> GetHolidaysAsync([FromBody] SearchCriteria criteria)
        {
            // Build the query
            var query = from e in _context.Holidays
                        join org in _context.Organizations on e.OrganizationCode equals org.OrganizationCode into orgGroup
                        from org in orgGroup.DefaultIfEmpty() // Left join with Organizations
                        join client in _context.Clients on e.OrganizationCode equals client.ClientCode into clientGroup
                        from client in clientGroup.DefaultIfEmpty() // Left join with Clients
                        orderby e.HolidayDate
                        select new HolidayDTO
                        {
                            HolidayId = e.HolidayId,
                            HolidayDate = e.HolidayDate,
                            Day = e.Day,
                            TitleEn = e.TitleEn,
                            TitleTh = e.TitleTh,
                            OrganizationCode = e.OrganizationCode,
                            OrganizationNameEn = org != null ? org.OrganizationNameEn : (client != null ? client.Company : null),
                            OrganizationNameTh = org != null ? org.OrganizationNameTh : (client != null ? client.Company : null),
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
                    query = query.Where(e => e.HolidayDate.Year == year);
                }
            }

            if (!string.IsNullOrEmpty(criteria.Title))
            {
                var title = criteria.Title.ToLower();

                query = query.Where(e =>
                    e.TitleEn.ToLower().Contains(title) ||
                    e.TitleTh.ToLower().Contains(title)
                );
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

            var response = new ApiResponse<HolidayDTO>
            {
                Data = holidays,
                TotalData = totalData
            };

            return Ok(response);
        }

        [HttpPost("copy")]
        public async Task<IActionResult> CopyHolidays([FromBody] HolidayCopyRequest request)
        {
            if (request.Holidays == null || request.Holidays.Count == 0 )
            {
                return BadRequest(new { message = "Invalid data." });
            }
            var maxId = await _context.Holidays
                            .MaxAsync(e => (int?)e.HolidayId);
            if (maxId == null)
            {
                // Handle the case where the table is empty
                maxId = 0;
            }
            foreach (var holiday in request.Holidays)
            {
                maxId = maxId + 1;
                // Create a new holiday entity and update its date to the destination year
                var newHoliday = new Holiday
                {
                    HolidayId = (int)maxId,
                    TitleTh = holiday.TitleTh,
                    TitleEn = holiday.TitleEn,
                    HolidayDate = holiday.HolidayDate.AddDays(1), // Date is already updated to the destination year on the frontend
                    OrganizationCode = holiday.OrganizationCode,
                    Day = holiday.HolidayDate.DayOfWeek.ToString(),
                    IsActive = holiday.IsActive,
                    IsAnnual = holiday.IsAnnual,
                    CreateBy = holiday.Username,
                    CreateDate = DateTime.UtcNow,
                };

                _context.Holidays.Add(newHoliday); 
            }

            await _context.SaveChangesAsync(); // Save changes to the database

            return Ok(new { message = "Holidays copied to the year " + request.DestinationYear });
        }

        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            // Example using HttpContext
            /* var userId = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);*/

            return username;
        }
        public class SearchCriteria
        {
            public string? Year { get; set; }
            public string? Title { get; set; }
            public string? OrganizationCode { get; set; }
            public bool? IsAnnual { get; set; }
        }

        public class HolidayCopyRequest
        {
            public List<HolidayDto>? Holidays { get; set; }
            public int DestinationYear { get; set; }
        }

        public class HolidayDto
        {
            public string? TitleTh { get; set; }
            public string? TitleEn { get; set; }
            public DateTime HolidayDate { get; set; }
            public string? OrganizationNameTh { get; set; }
            public string? OrganizationNameEn { get; set; }
            public int? OrganizationId { get; set; }
            public bool IsAnnual { get; set; }
            public string? OrganizationCode { get; set; }
            public bool IsActive { get; set; }
            public string? Username { get; set; }

        }
    }
}

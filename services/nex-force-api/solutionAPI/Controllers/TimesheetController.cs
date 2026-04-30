using AutoMapper;
using Humanizer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;
using solutionAPI.Services;
using static solutionAPI.Services.TimesheetService;

namespace solutionAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TimesheetController : ControllerBase
    {
        private readonly TimesheetService _timesheetService;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILoggingService _loggingService;
        public TimesheetController(ApplicationDbContext context, IMapper mapper, TimesheetService timesheetService, ILoggingService loggingService)
        {
            _mapper = mapper;
            _context = context;
            _timesheetService = timesheetService;
            _loggingService = loggingService;
        }

        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdateTimesheet([FromForm] TimesheetHeaderDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _timesheetService.CreateOrUpdateTimesheetAsync(dto);
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<TimesheetHeaderRespond>>> GetAllTimesheets(int empId)
        {
            try
            {
                var result = await _timesheetService.GetAllTimesheetsAsync(empId);

                if (result == null || !result.Any())
                {
                    return NotFound(new ApiResponse<TimesheetHeaderRespond>
                    {
                        Data = null,
                        TotalData = 0
                    });
                }

                return Ok(new ApiResponse<TimesheetHeaderRespond>
                {
                    Data = result.ToList(), // Convert to List<T>
                    TotalData = result.Count()
                });
            }
            catch (Exception ex)
            {
                throw new Exception(ex.ToString(), ex);

            }
        }

        [HttpGet("{timesheetId}")]
        public async Task<ActionResult<ApiResponse<TimesheetHeaderRespond>>> GetTimesheetById(int timesheetId)
        {
            try
            {
                var result = await _timesheetService.GetTimesheetByIdAsync(timesheetId);

                if (result == null)
                {
                    return NotFound(new ApiResponse<TimesheetHeaderRespond>
                    {
                        Data = null,
                        TotalData = 0
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.ToString(), ex);
            }
        }


        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteTimesheet(int id)
        {
            var tasks = await _context.Timesheets.FindAsync(id);
            if (tasks == null)
            {
                return NotFound(new { message = "Timesheet not found" });
            }

            _context.Timesheets.Remove(tasks);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Timesheet deleted successfully" });
        }

        [HttpGet("events")]
        public async Task<ActionResult<IEnumerable<object>>> GetEventData([FromQuery] int month, [FromQuery] int year, [FromQuery] int empId, [FromQuery] string lang = "en")
        {
            var employee = await _context.Employees
                .Where(e => e.Id == empId)
                .Select(e => e.OrganizationId)
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return NotFound(new { message = "Employee not found." });
            }
            var organizations = await _context.Organizations
             .Where(org => org.OrganizationId == employee) 
             .Select(org => org.OrganizationCode)
             .FirstOrDefaultAsync();

            var clients = await _context.Clients
                .Where(client => client.ClientId == employee)
                .Select(client => client.ClientCode)
                .FirstOrDefaultAsync();

            var organizationCodes = new List<string>();

            if (organizations != null) organizationCodes.Add(organizations);
            if (clients != null) organizationCodes.Add(clients);


            if (organizationCodes.Count == 0)
            {
                return NotFound(new { message = "No associated Organization found." });
            }

            var timesheetEvents = await _context.TimesheetDetails
             .Where(d => d.Timesheet != null &&
                         d.Timesheet.WorkDate.Year == year &&
                         d.Timesheet.WorkDate.Month == month &&
                         d.Timesheet.EmployeeId == empId)
             .Select(d => new
             {
                 id = "T-" + d.TimesheetHeaderId,
                 title = d.WorkName,
                 start = d.Timesheet.WorkDate.Add(d.StartTime).ToString("yyyy-MM-ddTHH:mm:ss", System.Globalization.CultureInfo.InvariantCulture),
                 end = d.Timesheet.WorkDate.Add(d.EndTime).ToString("yyyy-MM-ddTHH:mm:ss", System.Globalization.CultureInfo.InvariantCulture),
                 description = d.WorkDescription,
                 TimesheetHeaderId = (int?)d.TimesheetHeaderId,
                 employee_id = (int?)d.Timesheet.EmployeeId,
                 color = "#5677fc", // blue
                 textColor = "#ffffff"
             })
             .ToListAsync();

            // Special Days Events
            var specialDaysEvents = await _context.SpecialWorkingDays
                .Where(sd => sd.IsActive && sd.SpecialDate.Year == year && sd.SpecialDate.Month == month && organizationCodes.Contains(sd.OrganizationCode))
                .Select(sd => new
                {
                    id = "S-" + sd.SpecialDaysId,
                    title = lang == "th" ? sd.TitleTh : sd.TitleEn,
                    start = sd.SpecialDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture) + "T00:00:00",
                    end = sd.SpecialDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture) + "T23:59:59",
                    description = "Special Day",
                    TimesheetHeaderId = (int?)null,
                    employee_id = (int?)null,
                    color = "#343a40", //Dark Gray
                    textColor = "#ffffff" // White
                })
                .ToListAsync();

            //Holiday Events
            var holidayEvents = await _context.Holidays
                .Where(h => h.IsActive && h.HolidayDate.Year == year && h.HolidayDate.Month == month && organizationCodes.Contains(h.OrganizationCode))
                .Select(h => new
                {
                    id = "H-" + h.HolidayId,
                    title = lang == "th" ? h.TitleTh : h.TitleEn,
                    start = h.HolidayDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture) + "T00:00:00",
                    end = h.HolidayDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture) + "T23:59:59",
                    description = "Holiday",
                    TimesheetHeaderId = (int?)null,
                    employee_id = (int?)null,
                    color = "#343a40", //Dark Gray
                    textColor = "#ffffff" //White
                })
                .ToListAsync();

            // Leave Events
            var leaveEvents = await _context.LeaveRequests
                .Where(lr => lr.Status == "Approved" &&
                             lr.StartDate.Year == year && lr.StartDate.Month == month &&
                             lr.EmployeeId == empId)
                .Select(lr => new
                {
                    id = "L-" + lr.LeaveRequestId,
                    title = "Leave: " + lr.Reason,
                    start = lr.StartDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture) + "T00:00:00",
                    end = lr.EndDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture) + "T23:59:59",
                    description = "Leave approved",
                    TimesheetHeaderId = (int?)null,
                    employee_id = (int?)lr.EmployeeId,
                    color = "#FFD700", //Yellow
                    textColor = "#000000" //Black
                })
                .ToListAsync();
            // merge
            var events = timesheetEvents
                .Union(specialDaysEvents)
                .Union(holidayEvents)
                .Union(leaveEvents)
                .ToList();

            return Ok(events);
        }

        [HttpGet("getWorkDateOptions")]
        public IActionResult GetWorkDateOptions(int projectId)
        {
            var query = _context.Timesheets
                .Where(th => th.ProjectId == projectId);

            var days = query
                .Select(th => th.WorkDate.Month)
                .Distinct()
                .OrderBy(d => d)
                .ToList();

            var years = query
                .Select(th => th.WorkDate.Year)
                .Distinct()
                .OrderBy(y => y)
                .ToList();

            return Ok(new
            {
                Months = days,
                Years = years
            });
        }

        /* ─── Bulk Import from Excel ─── */

        public class TimesheetImportRowDto
        {
            public string? OrganizationCode { get; set; }
            public string? ProjectCode { get; set; }
            public string? WorkDate { get; set; }      // YYYY-MM-DD
            public string? JobType { get; set; }        // WFH / OS / CS
            public string? WorkName { get; set; }
            public decimal WorkHours { get; set; }
            public decimal OtHours { get; set; }
            public string? StartTime { get; set; }      // HH:mm
            public string? EndTime { get; set; }         // HH:mm
            public decimal WorkPercentage { get; set; }
            public string? WorkDescription { get; set; }
            public string? ProblemDescription { get; set; }
            public string? ProblemResolve { get; set; }
            public int EmployeeId { get; set; }
            public string? Username { get; set; }
        }

        [HttpGet("getJobTypes")]
        public async Task<IActionResult> GetJobTypes()
        {
            var result = await _context.Set<Middlewares.Models.EmployeeType>()
                .AsNoTracking()
                .OrderBy(x => x.EmployeeTypeId)
                .Select(x => new
                {
                    jobType = x.EmployeeTypeCode,
                    jobName = x.EmployeeTypeNameEn
                })
                .ToListAsync();
            return Ok(result);
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportTimesheets([FromBody] List<TimesheetImportRowDto> rows)
        {
            if (rows == null || rows.Count == 0)
                return BadRequest(new { success = 0, failed = 0, errorDetails = new[] { "No data to import." } });

            // Load allowed job types from DB
            var jobTypeCodes = await _context.Set<Middlewares.Models.EmployeeType>()
                .AsNoTracking()
                .Where(x => x.EmployeeTypeCode != null)
                .Select(x => x.EmployeeTypeCode!)
                .ToListAsync();
            var allowedJobTypes = new HashSet<string>(
                jobTypeCodes, StringComparer.OrdinalIgnoreCase);

            int successCount = 0;
            int failedCount = 0;
            var errorDetails = new List<string>();

            for (int i = 0; i < rows.Count; i++)
            {
                var row = rows[i];
                int rowNum = i + 1;
                var rowErrors = new List<string>();

                // ── Validate required fields ──
                if (string.IsNullOrWhiteSpace(row.OrganizationCode))
                    rowErrors.Add($"Row {rowNum}: Organization Code is required.");
                if (string.IsNullOrWhiteSpace(row.ProjectCode))
                    rowErrors.Add($"Row {rowNum}: Project is required.");
                if (string.IsNullOrWhiteSpace(row.WorkDate))
                    rowErrors.Add($"Row {rowNum}: Work Date is required.");
                if (string.IsNullOrWhiteSpace(row.WorkName))
                    rowErrors.Add($"Row {rowNum}: Work Name (Title) is required.");

                // ── Validate JobType ──
                if (!string.IsNullOrWhiteSpace(row.JobType) && !allowedJobTypes.Contains(row.JobType))
                    rowErrors.Add($"Row {rowNum}: Job Type \"{row.JobType}\" is invalid. Must be WFH, OS, or CS.");

                // ── Validate WorkDate ──
                DateTime parsedDate = DateTime.MinValue;
                if (!string.IsNullOrWhiteSpace(row.WorkDate))
                {
                    if (!DateTime.TryParse(row.WorkDate, out parsedDate))
                        rowErrors.Add($"Row {rowNum}: Work Date \"{row.WorkDate}\" is not a valid date (expected YYYY-MM-DD).");
                }

                // ── Validate times ──
                TimeSpan parsedStart = TimeSpan.Zero;
                TimeSpan parsedEnd = TimeSpan.Zero;
                if (!string.IsNullOrWhiteSpace(row.StartTime))
                {
                    if (!TimeSpan.TryParse(row.StartTime, out parsedStart))
                        rowErrors.Add($"Row {rowNum}: Start Time \"{row.StartTime}\" is invalid (expected HH:mm).");
                }
                if (!string.IsNullOrWhiteSpace(row.EndTime))
                {
                    if (!TimeSpan.TryParse(row.EndTime, out parsedEnd))
                        rowErrors.Add($"Row {rowNum}: End Time \"{row.EndTime}\" is invalid (expected HH:mm).");
                }
                if (parsedStart != TimeSpan.Zero && parsedEnd != TimeSpan.Zero && parsedEnd <= parsedStart)
                    rowErrors.Add($"Row {rowNum}: End Time must be after Start Time.");

                // ── Auto-calculate hours from StartTime/EndTime ──
                if (parsedStart != TimeSpan.Zero && parsedEnd != TimeSpan.Zero && parsedEnd > parsedStart)
                {
                    var calculatedHours = Math.Round((decimal)(parsedEnd - parsedStart).TotalHours, 2);
                    // If OtHours > 0 from client, treat as OT; otherwise treat as work hours
                    if (row.OtHours > 0)
                    {
                        row.OtHours = calculatedHours;
                        row.WorkHours = 0;
                    }
                    else
                    {
                        row.WorkHours = calculatedHours;
                        row.OtHours = 0;
                    }
                }

                // ── Validate hours ──
                if (row.WorkHours < 0)
                    rowErrors.Add($"Row {rowNum}: Work Hours cannot be negative.");
                if (row.OtHours < 0)
                    rowErrors.Add($"Row {rowNum}: OT Hours cannot be negative.");
                if (row.WorkPercentage < 0 || row.WorkPercentage > 100)
                    rowErrors.Add($"Row {rowNum}: Work Percentage must be between 0 and 100.");

                // Skip DB lookups if there are already errors
                if (rowErrors.Count > 0)
                {
                    failedCount++;
                    errorDetails.AddRange(rowErrors);
                    continue;
                }

                // ── DB lookups per row ──
                try
                {
                    // Validate OrganizationCode
                    var orgExists = await _context.Organizations
                        .AsNoTracking()
                        .AnyAsync(o => o.OrganizationCode != null 
                            && o.OrganizationCode.ToLower() == row.OrganizationCode!.ToLower());
                    if (!orgExists)
                    {
                        orgExists = await _context.Clients
                            .AsNoTracking()
                            .AnyAsync(c => c.ClientCode != null 
                                && c.ClientCode.ToLower() == row.OrganizationCode!.ToLower());
                    }
                    if (!orgExists)
                    {
                        failedCount++;
                        errorDetails.Add($"Row {rowNum}: Organization Code \"{row.OrganizationCode}\" not found.");
                        continue;
                    }

                    // Find project by Code or Name
                    var project = await _context.Projects
                        .AsNoTracking()
                        .Where(p => (p.ProjectCode != null && p.ProjectCode.ToLower() == row.ProjectCode!.ToLower())
                                 || (p.ProjectName != null && p.ProjectName.ToLower() == row.ProjectCode!.ToLower()))
                        .Select(p => new { p.ProjectId, p.EndDate })
                        .FirstOrDefaultAsync();

                    if (project == null)
                    {
                        failedCount++;
                        errorDetails.Add($"Row {rowNum}: Project \"{row.ProjectCode}\" not found.");
                        continue;
                    }

                    // ── Create records ──
                    var header = new Middlewares.Models.Timesheet
                    {
                        EmployeeId = row.EmployeeId,
                        ProjectId = project.ProjectId,
                        WorkDate = DateTime.SpecifyKind(parsedDate.Date, DateTimeKind.Utc),
                        ProjectDeadline = project.EndDate,
                        JobType = row.JobType?.ToUpper(),
                        OrganizationCode = row.OrganizationCode,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = row.Username ?? "import",
                        TotalWorkHours = row.WorkHours,
                        TotalOtHours = row.OtHours,
                    };

                    _context.Timesheets.Add(header);
                    await _context.SaveChangesAsync();

                    var detail = new Middlewares.Models.TimesheetDetail
                    {
                        TimesheetHeaderId = header.TimesheetHeaderId,
                        WorkName = row.WorkName!,
                        StartTime = parsedStart,
                        EndTime = parsedEnd,
                        ActualHours = row.WorkHours,
                        OtHours = row.OtHours,
                        IsOt = row.OtHours > 0,
                        WorkPercentage = row.WorkPercentage,
                        WorkDescription = row.WorkDescription,
                        ProblemDescription = row.ProblemDescription,
                        ProblemResolve = row.ProblemResolve,
                    };

                    _context.TimesheetDetails.Add(detail);
                    await _context.SaveChangesAsync();

                    successCount++;
                }
                catch (Exception ex)
                {
                    failedCount++;
                    errorDetails.Add($"Row {rowNum}: Database error — {ex.Message}");
                }
            }

            return Ok(new { success = successCount, failed = failedCount, errorDetails });
        }
    }
}

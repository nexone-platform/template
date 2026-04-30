using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Attendance_Server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AttendanceListController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILoggingService _loggingService;
        public AttendanceListController(ApplicationDbContext context, ILoggingService loggingService)
        {
            _context = context;
            _loggingService = loggingService;
        }
        public class LogCheckInOutRequest
        {
            public int EmployeeId { get; set; }
            public double CurrentLat { get; set; }
            public double CurrentLon { get; set; }
            public string? Username { get; set; }
        }
        // Punch In or Out
        [HttpPost("log-check-in-out")]
        public async Task<IActionResult> LogCheckInOut([FromBody] LogCheckInOutRequest request)
        {
            double companyLat = 15.4863668001542;  // Example latitude of the company
            double companyLon = 101.14440128408029; // Example longitude of the company
            double allowedRadius = 1000; // Allowable radius in meters (e.g., 1 km)
            try
            {
                var distance = CalculateDistance(companyLat, companyLon, request.CurrentLat, request.CurrentLon);

                // Check if the employee is within the allowed radius
/*                if (distance > allowedRadius)
                {
                    return BadRequest( new { message = "Check-in/out failed: You are out of the allowed company range." });
                }*/

                var result = await _context.LogCheckInOutResults
                               .FromSqlRaw("SELECT \"solution-one\".\"hr-fn-check-in-out\"({0}, {1}, {2}, {3}) AS Message", request.EmployeeId, request.Username, request.CurrentLat, request.CurrentLon)
                               .ToListAsync();

                // Assuming the function returns a message in Thai
                return Ok(result);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "MyActionPage", request.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpGet("getAllTimeSheet")]
        public async Task<IActionResult> GetAllTimesheet()
        {
            try
            {
                var query =
                    from c in _context.CheckIns

                    join e0 in _context.Employees
                        on c.EmployeeId equals (int?)e0.Id into emp
                    from e in emp.DefaultIfEmpty()          // LEFT JOIN employees

                    join d0 in _context.Departments
                        on e.DepartmentId equals d0.DepartmentId into dept
                    from d in dept.DefaultIfEmpty()         // LEFT JOIN departments

                    where e.IsSuperadmin != true

                    select new
                    {
                        c.CheckInId,
                        c.EmployeeId,

                        EmployeeCode = e.EmployeeId,
                        EmployeeName = e.FirstNameEn + " " + e.LastNameEn,
                        DepartmentId = d.DepartmentId,
                        DepartmentName = d.DepartmentNameTh,

                        c.CheckInTime,
                        c.CheckOutTime,
                        c.BreakStartTime,
                        c.BreakEndTime,

                        BreakDuration =
                            c.BreakStartTime.HasValue && c.BreakEndTime.HasValue
                                ? Math.Round(
                                    (c.BreakEndTime.Value - c.BreakStartTime.Value).TotalHours, 2)
                                : (double?)null,

                        c.CreateDate,
                        c.CreateBy,
                        c.UpdateDate,
                        c.UpdateBy,
                        c.CheckInLat,
                        c.CheckInLong,
                        c.CheckOutLat,
                        c.CheckOutLong
                    };

                var list = await query.ToListAsync();

                // ===== คำนวณ OT ต่อ 1 แถว =====
                var result = list.Select(x =>
                {
                    double? overtimeDuration = null;

                    if (x.CheckOutTime.HasValue &&
                        x.CheckOutTime.Value.TimeOfDay > new TimeSpan(18, 30, 0))
                    {
                        var overtimeStart =
                            x.CheckOutTime.Value.Date.Add(new TimeSpan(18, 30, 0));

                        overtimeDuration = Math.Round(
                            (x.CheckOutTime.Value - overtimeStart).TotalHours, 2);
                    }

                    return new
                    {
                        x.CheckInId,
                        x.EmployeeId,
                        x.EmployeeCode,
                        x.EmployeeName,
                        x.DepartmentId,
                        x.DepartmentName,

                        x.CheckInTime,
                        x.CheckOutTime,
                        x.BreakStartTime,
                        x.BreakEndTime,
                        x.BreakDuration,
                        OvertimeDuration = overtimeDuration,

                        x.CreateDate,
                        x.CreateBy,
                        x.UpdateDate,
                        x.UpdateBy,
                        x.CheckInLat,
                        x.CheckInLong,
                        x.CheckOutLat,
                        x.CheckOutLong
                    };
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "MyActionPage", "Username");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }


        [HttpGet("{employeeId}")]
        public async Task<IActionResult> GetTimesheet(int employeeId)
        {
            try
            {
                var today = DateTime.UtcNow.Date;

                var query =
                    from c in _context.CheckIns

                    join e0 in _context.Employees
                        on c.EmployeeId equals (int?)e0.Id into emp
                    from e in emp.DefaultIfEmpty()          // LEFT JOIN employees

                    join d0 in _context.Departments
                        on e.DepartmentId equals d0.DepartmentId into dept
                    from d in dept.DefaultIfEmpty()         // LEFT JOIN departments

                    where c.EmployeeId == employeeId
                          && c.CheckInTime.HasValue
                          && c.CheckInTime.Value.Date == today

                    select new
                    {
                        c.CheckInId,
                        c.EmployeeId,

                        // ==== Employee / Department ====
                        EmployeeCode = e.EmployeeId,
                        EmployeeName = e.FirstNameEn + " " + e.LastNameEn,
                        DepartmentId = d.DepartmentId,
                        DepartmentName = d.DepartmentNameTh,

                        // ==== Time data ====
                        CheckInTime = c.CheckInTime,
                        CheckOutTime = c.CheckOutTime,
                        BreakStartTime = c.BreakStartTime,
                        BreakEndTime = c.BreakEndTime,

                        BreakDuration =
                            c.BreakStartTime.HasValue && c.BreakEndTime.HasValue
                                ? Math.Round(
                                    (c.BreakEndTime.Value - c.BreakStartTime.Value).TotalHours, 2)
                                : (double?)null,

                        c.CreateDate,
                        c.CreateBy,
                        c.UpdateDate,
                        c.UpdateBy,
                        c.CheckInLat,
                        c.CheckInLong,
                        c.CheckOutLat,
                        c.CheckOutLong
                    };

                var checkIns = await query.FirstOrDefaultAsync();

                // ===== ไม่พบข้อมูล =====
                if (checkIns == null)
                {
                    return Ok(new
                    {
                        CheckInTime = (DateTime?)null,
                        CheckOutTime = (DateTime?)null,
                        BreakStartTime = (DateTime?)null,
                        BreakEndTime = (DateTime?)null,
                        BreakDuration = (double?)null,
                        OvertimeDuration = (double?)null,
                        CheckInLat = (double?)null,
                        CheckInLong = (double?)null,
                        CheckOutLat = (double?)null,
                        CheckOutLong = (double?)null
                    });
                }

                // ===== คำนวณ OT =====
                double? overtimeDuration = null;
                if (checkIns.CheckOutTime.HasValue &&
                    checkIns.CheckOutTime.Value.TimeOfDay > new TimeSpan(18, 30, 0))
                {
                    var overtimeStart =
                        checkIns.CheckOutTime.Value.Date.Add(new TimeSpan(18, 30, 0));

                    overtimeDuration = Math.Round(
                        (checkIns.CheckOutTime.Value - overtimeStart).TotalHours, 2);
                }

                return Ok(new
                {
                    checkIns.CheckInId,
                    checkIns.EmployeeId,
                    checkIns.EmployeeCode,
                    checkIns.EmployeeName,
                    checkIns.DepartmentId,
                    checkIns.DepartmentName,

                    checkIns.CheckInTime,
                    checkIns.CheckOutTime,
                    checkIns.BreakStartTime,
                    checkIns.BreakEndTime,
                    checkIns.BreakDuration,
                    OvertimeDuration = overtimeDuration,

                    checkIns.CreateDate,
                    checkIns.CreateBy,
                    checkIns.UpdateDate,
                    checkIns.UpdateBy,
                    checkIns.CheckInLat,
                    checkIns.CheckInLong,
                    checkIns.CheckOutLat,
                    checkIns.CheckOutLong
                });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "MyActionPage", "Username");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpGet("check-status/{employeeId}")]
        public async Task<IActionResult> CheckCheckInOutStatus(int employeeId)
        {
            try
            {
                var today = DateTime.UtcNow.Date;

                // Query to get the employee's check-in and check-out status for the day
                var checkInOutStatus = await _context.CheckIns
                    .Where(c => c.EmployeeId == employeeId && c.CheckInTime.HasValue && c.CheckInTime.Value.Date == today)
                    .Select(c => new
                    {
                        CheckInTime = c.CheckInTime,
                        CheckOutTime = c.CheckOutTime.HasValue ? c.CheckOutTime : null,
                        BreakStartTime = c.BreakStartTime.HasValue ? c.BreakStartTime : null,
                        BreakEndTime = c.BreakEndTime.HasValue ? c.BreakEndTime : null,
                    })
                    .FirstOrDefaultAsync();

                if (checkInOutStatus == null)
                {
                    // No check-in record found, return status for Punch In
                    return Ok(new { status = "punch-in" });
                }
                else if (checkInOutStatus.CheckOutTime == null)
                {
                    if (checkInOutStatus.BreakStartTime == null)
                    {
                        // Check-in found, no break yet, return status for Start Break
                        return Ok(new { status = "start-break" });
                    }
                    else if (checkInOutStatus.BreakEndTime == null)
                    {
                        // Break started but not ended, return status for End Break
                        return Ok(new { status = "end-break" });
                    }
                    else
                    {
                        // Break ended, return status for Punch Out
                        return Ok(new { status = "punch-out" });
                    }
                }
                else
                {
                    // Both check-in and check-out completed, disable button
                    return Ok(new { status = "completed" });
                }
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "CheckCheckInOutStatus", "Username");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }
        public class CheckInActivityDto
        {
            public DateTime? PunchIn { get; set; }
            public DateTime? PunchOut { get; set; }
            public DateTime? BreakStart { get; set; }
            public DateTime? BreakEnd { get; set; }
        }

        [HttpGet("activities/{employeeId}")]
        public async Task<IActionResult> GetEmployeeActivity(int employeeId)
        {
            // Get today's date
            var today = DateTime.UtcNow.Date;

            // Query to get check-in and check-out data for today
            var activities = await _context.CheckIns
                .Where(c => c.EmployeeId == employeeId && c.CheckInTime.HasValue && c.CheckInTime.Value.Date == today)
                .OrderBy(c => c.CheckInTime)
                .Select(c => new CheckInActivityDto
                {
                    PunchIn = c.CheckInTime.HasValue ? c.CheckInTime : null,   // No need to convert to string
                    PunchOut = c.CheckOutTime.HasValue ? c.CheckOutTime : null, // Handle as DateTime?
                    BreakStart = c.BreakStartTime.HasValue ? c.BreakStartTime : null, // Handle as DateTime?
                    BreakEnd = c.BreakEndTime.HasValue ? c.BreakEndTime : null // Handle as DateTime?
                })
                .ToListAsync();

            // Return the activities in the desired format
            if (activities.Count == 0)
            {
                return NotFound(new { message = "No activities found for today." });
            }

            return Ok(activities);
        }

        [HttpGet("work-stats/{employeeId}")]
        public async Task<IActionResult> GetWorkStatistics(int employeeId)
        {
            var today = DateTime.UtcNow.Date; // Ensure we're using UTC
            var weekStart = today.AddDays(-(int)today.DayOfWeek); // Start of the week
            var monthStart = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc); // Start of the month

            // Function to calculate total hours worked, considering break times
            async Task<double> CalculateTotalHoursWorked(DateTime start, DateTime end)
            {
                var totalHours = await _context.CheckIns
                    .Where(c => c.EmployeeId == employeeId
                                && c.CheckInTime.HasValue
                                && c.CheckInTime.Value >= start
                                && c.CheckInTime.Value < end)
                    .Select(c =>
                        (c.CheckOutTime.HasValue
                            ? (c.CheckOutTime.Value.ToUniversalTime() - c.CheckInTime.Value.ToUniversalTime()
                            - (c.BreakStartTime.HasValue && c.BreakEndTime.HasValue
                                ? (c.BreakEndTime.Value.ToUniversalTime() - c.BreakStartTime.Value.ToUniversalTime())
                                : TimeSpan.Zero))
                            : TimeSpan.Zero).TotalHours)
                    .SumAsync();

                return totalHours;
            }

            // Today's work hours
            var todayStats = await CalculateTotalHoursWorked(today, today.AddDays(1));
            var dailyTarget = 8.0; // Assume 8 hours is the target for today
            var todayPercentage = Math.Round((todayStats / dailyTarget) * 100, 2); // Calculate percentage

            // This week's work hours
            var weekStats = await CalculateTotalHoursWorked(weekStart, today.AddDays(1));
            var weeklyTarget = 40.0; // Assume 40 hours is the target for the week
            var weekPercentage = Math.Round((weekStats / weeklyTarget) * 100, 2); // Calculate percentage

            // This month's work hours
            var monthStats = await CalculateTotalHoursWorked(monthStart, today.AddDays(1));
            var monthlyTarget = 160.0; // Assume 160 hours is the target for the month
            var monthPercentage = Math.Round((monthStats / monthlyTarget) * 100, 2); // Calculate percentage

            // Remaining hours
            var remainingHours = monthlyTarget- (monthlyTarget - monthStats);

            // Overtime (hours beyond the monthly target)
            var overtime = monthStats > monthlyTarget ? monthStats - monthlyTarget : 0;

            // Build the response
            var stats = new
            {
                Today = Math.Round(todayStats, 2),
                TodayPercentage = todayPercentage,
                ThisWeek = Math.Round(weekStats, 2),
                WeekPercentage = weekPercentage,
                ThisMonth = Math.Round(monthStats, 2),
                MonthPercentage = monthPercentage,
                Remaining = Math.Round(remainingHours, 2),
                Overtime = Math.Round(overtime, 2)
            };

            return Ok(stats);
        }

        public class CheckInResponse
        {
            public int CheckInId { get; set; }
            public int? EmployeeId { get; set; }
            public int? DepartmentId { get; set; }
            public string? EmployeeCode { get; set; }
            public string? EmployeeName { get; set; }
            public string? DepartmentName { get; set; }
            public string? LeaveReason { get; set; }
            public DateTime? CheckInTime { get; set; }
            public DateTime? CheckOutTime { get; set; }
            public DateTime WorkDate { get; set; }
            public double? CheckInLat { get; set; }
            public double? CheckInLong { get; set; }
            public double? CheckOutLat { get; set; }
            public double? CheckOutLong { get; set; }
            public int? OrganizationId { get; set; }
            public string? OrganizationCode { get; set; }
            public string? OrganizationName { get; set; }
            public string? SpecialTitle { get; set; }
            public double? ProductionHours { get; set; }
            public double? BreakHours { get; set; }
            public double? Overtime { get; set; }
        }

        [HttpGet("check-ins-data/{employeeId}")]
        public async Task<IActionResult> GetCheckIns(int employeeId)
        {
            var checkIns = await _context.CheckIns
                .Where(c => c.EmployeeId == employeeId) // Filter by employeeId
                .Select(c => new CheckInResponse
                {
                    CheckInId = c.CheckInId,
                    EmployeeId = c.EmployeeId,
                    CheckInTime = c.CheckInTime.HasValue ? c.CheckInTime.Value.ToLocalTime() : DateTime.MinValue,
                    CheckOutTime = c.CheckOutTime.HasValue ? c.CheckOutTime.Value.ToLocalTime() : DateTime.MinValue,
                    ProductionHours = Math.Round(CalculateProductionHours(c.CheckInTime.HasValue ? c.CheckInTime.Value.ToLocalTime() : DateTime.MinValue, c.CheckOutTime.HasValue ? c.CheckOutTime.Value.ToLocalTime() : DateTime.MinValue, c.BreakStartTime.HasValue ? c.BreakStartTime.Value.ToLocalTime() : DateTime.MinValue, c.BreakEndTime.HasValue ? c.BreakEndTime.Value.ToLocalTime() : DateTime.MinValue), 2),
                    BreakHours = Math.Round(CalculateBreakHours(c.BreakStartTime.HasValue ? c.BreakStartTime.Value.ToLocalTime() : DateTime.MinValue, c.BreakEndTime.HasValue ? c.BreakEndTime.Value.ToLocalTime() : DateTime.MinValue), 2),
                    Overtime = Math.Round(CalculateOvertime(c.CheckInTime.HasValue ? c.CheckInTime.Value.ToLocalTime() : DateTime.MinValue, c.CheckOutTime.HasValue ? c.CheckOutTime.Value.ToLocalTime() : DateTime.MinValue), 2)
                })
                .ToListAsync();

            return Ok(checkIns);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CheckInResponse>>> SearchCheckIns(int? employeeId, DateTime? date, int? month, int? year)
        {
            var checkInsQuery = _context.CheckIns
                .Where(c => c.EmployeeId == employeeId); // Always filter by employeeId

            // Apply date filter
            if (date.HasValue)
            {
                checkInsQuery = checkInsQuery.Where(c => c.CheckInTime.HasValue && c.CheckInTime.Value.Date == date.Value.Date);
            }

            // Apply month filter
            if (month.HasValue)
            {
                checkInsQuery = checkInsQuery.Where(c => c.CheckInTime.HasValue && c.CheckInTime.Value.Month == month.Value);
            }

            // Apply year filter
            if (year.HasValue)
            {
                checkInsQuery = checkInsQuery.Where(c => c.CheckInTime.HasValue && c.CheckInTime.Value.Year == year.Value);
            }

            var checkIns = await checkInsQuery
                .Select(c => new CheckInResponse
                {
                    CheckInId = c.CheckInId,
                    EmployeeId = c.EmployeeId,
                    CheckInTime = c.CheckInTime.HasValue ? c.CheckInTime.Value.ToLocalTime() : DateTime.MinValue,
                    CheckOutTime = c.CheckOutTime.HasValue ? c.CheckOutTime.Value.ToLocalTime() : DateTime.MinValue,
                    ProductionHours = Math.Round(CalculateProductionHours(c.CheckInTime.HasValue ? c.CheckInTime.Value.ToLocalTime() : DateTime.MinValue, c.CheckOutTime.HasValue ? c.CheckOutTime.Value.ToLocalTime() : DateTime.MinValue, c.BreakStartTime.HasValue ? c.BreakStartTime.Value.ToLocalTime() : DateTime.MinValue, c.BreakEndTime.HasValue ? c.BreakEndTime.Value.ToLocalTime() : DateTime.MinValue), 2),
                    BreakHours = Math.Round(CalculateBreakHours(c.BreakStartTime.HasValue ? c.BreakStartTime.Value.ToLocalTime() : DateTime.MinValue, c.BreakEndTime.HasValue ? c.BreakEndTime.Value.ToLocalTime() : DateTime.MinValue), 2),
                    Overtime = Math.Round(CalculateOvertime(c.CheckInTime.HasValue ? c.CheckInTime.Value.ToLocalTime() : DateTime.MinValue, c.CheckOutTime.HasValue ? c.CheckOutTime.Value.ToLocalTime() : DateTime.MinValue), 2)
                })
                .ToListAsync();

            return Ok(checkIns);
        }

        public class CheckInSearchRequest
        {
            public DateTime? SelectedDate { get; set; }
            public int? SelectedMonth { get; set; }
            public int? SelectedYear { get; set; }
            //public int EmployeeId { get; set; } // Include EmployeeId for filtering
            public string? EmployeeCode { get; set; }
            public string? EmployeeName { get; set; }
            public int? DepartmentId { get; set; }
        }

        [HttpPost("search")]
        public async Task<IActionResult> SearchCheckIns([FromBody] CheckInSearchRequest searchRequest)
        {
           try 
           {
               // กำหนดค่า default ของเดือนและปี ถ้าไม่ได้ระบุให้ใช้เดือนและปีปัจจุบัน
               var selectedMonth = searchRequest.SelectedMonth ?? DateTime.Now.Month;
               var selectedYear = searchRequest.SelectedYear ?? DateTime.Now.Year;

               // หาวันแรกและวันสุดท้ายของช่วงที่ต้องการแสดง
               DateTime firstDayOfMonth;
               DateTime lastDayOfMonth;
               List<DateTime> daysInMonth;

               if (searchRequest.SelectedDate.HasValue)
               {
                   // ถ้าเลือกวันที่เฉพาะเจาะจง → แสดงแค่วันนั้น
                   var selectedDate = searchRequest.SelectedDate.Value.Date;
                   firstDayOfMonth = selectedDate;
                   lastDayOfMonth = selectedDate;
                   daysInMonth = new List<DateTime> { selectedDate };
               }
               else
               {
                   // ถ้าเลือกเดือน/ปี → แสดงทุกวันในเดือน
                   firstDayOfMonth = new DateTime(selectedYear, selectedMonth, 1);
                   lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);
                   daysInMonth = Enumerable.Range(1, DateTime.DaysInMonth(selectedYear, selectedMonth))
                       .Select(day => new DateTime(selectedYear, selectedMonth, day))
                       .ToList();
               }

               var checkInQuery =
                   from c in _context.CheckIns
                   join e in _context.Employees on c.EmployeeId equals (int?)e.Id into emp
                   from e in emp.DefaultIfEmpty()

                   join d in _context.Departments on e.DepartmentId equals d.DepartmentId into dept
                   from d in dept.DefaultIfEmpty()

                   join o in _context.Organizations on e.OrganizationId equals o.OrganizationId into ognt
                   from o in ognt.DefaultIfEmpty()

                   join s in _context.SpecialWorkingDays on o.OrganizationCode equals s.OrganizationCode into scwd
                   from s in scwd.DefaultIfEmpty()

                   join l in _context.LeaveRequests
                       on c.EmployeeId equals (decimal?)l.EmployeeId into lq
                   from l in lq
                       .Where(l =>
                           c.CheckInTime.HasValue &&
                           c.CheckInTime.Value.Date >= l.StartDate.Date &&
                           c.CheckInTime.Value.Date <= l.EndDate.Date &&
                           l.Status == "Approved")
                       .DefaultIfEmpty()

                   select new RawAttendanceDto
                   {
                       EmployeeId = c.EmployeeId,
                       CheckInId = c.CheckInId,
                       WorkDate = c.CheckInTime.Value.Date,

                       CheckInTime = c.CheckInTime,
                       CheckOutTime = c.CheckOutTime,
                       BreakStartTime = c.BreakStartTime,
                       BreakEndTime = c.BreakEndTime,
                       CheckInLat = c.CheckInLat,
                       CheckOutLat = c.CheckOutLat,
                       CheckInLong = c.CheckInLong,
                       CheckOutLong = c.CheckOutLong,

                       EmployeeCode = e.EmployeeId,
                       EmployeeName = e.FirstNameEn + " " + e.LastNameEn,

                       OrganizationId = e.OrganizationId,
                       SpecialTitle = s.TitleTh,

                       DepartmentId = d.DepartmentId,
                       DepartmentName = d.DepartmentNameEn,

                       LeaveReason = l.Reason
                   };

               var leaveOnlyQuery =
               from l in _context.LeaveRequests
               join e in _context.Employees on (int)l.EmployeeId equals e.Id
               join d in _context.Departments on e.DepartmentId equals d.DepartmentId into dept
               from d in dept.DefaultIfEmpty()

               where !_context.CheckIns.Any(c =>
                   c.EmployeeId == l.EmployeeId &&
                   c.CheckInTime.HasValue &&
                   c.CheckInTime.Value.Date >= l.StartDate.Date &&
                   c.CheckInTime.Value.Date <= l.EndDate.Date)

               select new RawAttendanceDto
               {
                   EmployeeId = (int)l.EmployeeId,
                   CheckInId = null,
                   WorkDate = l.StartDate.Date,

                   CheckInTime = null,
                   CheckOutTime = null,
                   BreakStartTime = null,
                   BreakEndTime = null,
                   CheckInLat = null,
                   CheckOutLat = null,
                   CheckInLong = null,
                   CheckOutLong = null,

                   EmployeeCode = e.EmployeeId,
                   EmployeeName = e.FirstNameEn + " " + e.LastNameEn,

                   OrganizationId = e.OrganizationId,
                   SpecialTitle = null,

                   DepartmentId = d.DepartmentId,
                   DepartmentName = d.DepartmentNameEn,

                   LeaveReason = l.Reason
               };

               var query = checkInQuery.Union(leaveOnlyQuery);

               // Apply filtering based on search criteria
               if (!string.IsNullOrWhiteSpace(searchRequest.EmployeeCode))
               {
                   var code = searchRequest.EmployeeCode.Trim().ToLower();
                   query = query.Where(x =>
                       x.EmployeeCode != null &&
                       x.EmployeeCode.ToLower().Contains(code)
                   );
               }

               if (searchRequest.SelectedDate.HasValue)
               {
                   var date = searchRequest.SelectedDate.Value.Date;
                   query = query.Where(x => x.WorkDate == date);
               }

               if (searchRequest.SelectedMonth.HasValue)
               {
                   var month = searchRequest.SelectedMonth.Value;
                   query = query.Where(x => x.WorkDate.Month == month);
               }

               if (searchRequest.SelectedYear.HasValue)
               {
                   var year = searchRequest.SelectedYear.Value;
                   query = query.Where(x => x.WorkDate.Year == year);
               }

               if (!string.IsNullOrWhiteSpace(searchRequest.EmployeeName))
               {
                   var keyword = searchRequest.EmployeeName.Trim().ToLower();
                   query = query.Where(x => x.EmployeeName.ToLower().Contains(keyword));
               }

               if (searchRequest.DepartmentId.HasValue && searchRequest.DepartmentId > 0)
               {
                   query = query.Where(x => x.DepartmentId == searchRequest.DepartmentId.Value);
               }

               var rawData = await query.ToListAsync();

               // รวมข้อมูลตาม EmployeeId และ WorkDate
               var groupedData = rawData
                   .GroupBy(x => new { x.EmployeeId, x.WorkDate })
                   .Select(g => g.First())
                   .ToList();

               // หาพนักงานที่ตรงกับเงื่อนไข
               var employeeIds = groupedData.Select(x => x.EmployeeId).Distinct().ToList();

               // ดึงข้อมูลพนักงานจากฐานข้อมูล (ไม่รวม superadmin)
               var employees = await _context.Employees
                   .Where(e => employeeIds.Contains((int?)e.Id) && e.IsSuperadmin != true)
                   .Select(e => new
                   {
                       e.Id,
                       EmployeeCode = e.EmployeeId,
                       EmployeeName = e.FirstNameEn + " " + e.LastNameEn,
                       e.DepartmentId
                   })
                   .ToListAsync();

               var departments = await _context.Departments
                   .Where(d => employees.Select(e => e.DepartmentId).Contains(d.DepartmentId))
                   .ToDictionaryAsync(d => d.DepartmentId, d => d.DepartmentNameEn);

               // ดึงข้อมูล SpecialWorkingDays สำหรับช่วงเดือนที่เลือก
               var specialWorkingDays = await _context.SpecialWorkingDays
                   .Where(s => s.SpecialDate >= firstDayOfMonth && s.SpecialDate <= lastDayOfMonth)
                   .Select(s => new
                   {
                       s.SpecialDate,
                       s.TitleTh,
                       s.OrganizationCode
                   })
                   .ToListAsync();

               // สร้าง Dictionary สำหรับค้นหา Special Working Days ตามวันที่และ OrganizationCode
               var specialDaysDict = specialWorkingDays
                   .GroupBy(s => new { Date = s.SpecialDate.Date, s.OrganizationCode })
                   .ToDictionary(
                       g => g.Key,
                       g => g.First().TitleTh
                   );

               // ดึงข้อมูล OrganizationCode ของพนักงาน
               var employeeOrganizations = await _context.Employees
                   .Where(e => employeeIds.Contains((int?)e.Id))
                   .Join(_context.Organizations,
                       e => e.OrganizationId,
                       o => o.OrganizationId,
                       (e, o) => new { EmployeeId = e.Id, o.OrganizationCode })
                   .ToDictionaryAsync(x => x.EmployeeId, x => x.OrganizationCode);

               // สร้างผลลัพธ์ที่มีทุกวันในเดือน
               var result = new List<CheckInResponse>();

               foreach (var emp in employees)
               {
                   foreach (var date in daysInMonth)
                   {
                       var attendance = groupedData.FirstOrDefault(x => 
                           x.EmployeeId == emp.Id && 
                           x.WorkDate.Date == date.Date);

                       // ตรวจสอบว่าเป็นวันเสาร์หรืออาทิตย์หรือไม่
                       var isWeekend = date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday;

                       // ตรวจสอบว่ามี Special Working Day หรือไม่
                       string? specialDayTitle = null;
                       if (employeeOrganizations.TryGetValue(emp.Id, out var orgCode))
                       {
                           var key = new { Date = date.Date, OrganizationCode = orgCode };
                           specialDaysDict.TryGetValue(key, out specialDayTitle);
                       }

                       if (attendance != null)
                       {
                           // มีข้อมูลการเข้างาน
                           // ลำดับความสำคัญ: Special Working Day > Weekend > Leave Reason
                           var leaveReason = !string.IsNullOrEmpty(specialDayTitle) 
                               ? specialDayTitle 
                               : (isWeekend ? "วันหยุดสุดสัปดาห์" : attendance.LeaveReason);

                           result.Add(new CheckInResponse
                           {
                               CheckInId = attendance.CheckInId ?? 0,
                               EmployeeId = attendance.EmployeeId,
                               WorkDate = date,

                               EmployeeCode = emp.EmployeeCode,
                               EmployeeName = emp.EmployeeName,

                               DepartmentId = emp.DepartmentId,
                               DepartmentName = departments.ContainsKey(emp.DepartmentId ?? 0) 
                                   ? departments[emp.DepartmentId ?? 0] 
                                   : null,

                               LeaveReason = leaveReason,

                               CheckInTime = attendance.LeaveReason != null 
                                   ? date.Date 
                                   : attendance.CheckInTime,

                               CheckOutTime = attendance.LeaveReason != null 
                                   ? date.Date 
                                   : attendance.CheckOutTime,

                               CheckInLat = attendance.CheckInLat,
                               CheckInLong = attendance.CheckInLong,
                               CheckOutLat = attendance.CheckOutLat,
                               CheckOutLong = attendance.CheckOutLong,

                               ProductionHours = attendance.CheckInTime.HasValue && attendance.CheckOutTime.HasValue
                                   ? Math.Round(
                                       CalculateProductionHours(
                                           attendance.CheckInTime.Value.ToLocalTime(),
                                           attendance.CheckOutTime.Value.ToLocalTime(),
                                           attendance.BreakStartTime ?? DateTime.MinValue,
                                           attendance.BreakEndTime ?? DateTime.MinValue
                                       ), 2)
                                   : 0,

                               BreakHours = attendance.BreakStartTime.HasValue && attendance.BreakEndTime.HasValue
                                   ? Math.Round(
                                       CalculateBreakHours(
                                           attendance.BreakStartTime.Value.ToLocalTime(),
                                           attendance.BreakEndTime.Value.ToLocalTime()
                                       ), 2)
                                   : 0,

                               Overtime = attendance.CheckInTime.HasValue && attendance.CheckOutTime.HasValue
                                   ? Math.Round(
                                       CalculateOvertime(
                                           attendance.CheckInTime.Value.ToLocalTime(),
                                           attendance.CheckOutTime.Value.ToLocalTime()
                                       ), 2)
                                   : 0
                           });
                       }
                       else
                       {
                           // ไม่มีข้อมูลการเข้างาน - สร้างแถวว่าง
                           // ลำดับความสำคัญ: Special Working Day > Weekend > null
                           var leaveReason = !string.IsNullOrEmpty(specialDayTitle) 
                               ? specialDayTitle 
                               : (isWeekend ? "วันหยุดสุดสัปดาห์" : null);

                           result.Add(new CheckInResponse
                           {
                               CheckInId = 0,
                               EmployeeId = (int?)emp.Id,
                               WorkDate = date,

                               EmployeeCode = emp.EmployeeCode,
                               EmployeeName = emp.EmployeeName,

                               DepartmentId = emp.DepartmentId,
                               DepartmentName = departments.ContainsKey(emp.DepartmentId ?? 0) 
                                   ? departments[emp.DepartmentId ?? 0] 
                                   : null,

                               LeaveReason = leaveReason,
                               CheckInTime = null,
                               CheckOutTime = null,
                               CheckInLat = null,
                               CheckInLong = null,
                               CheckOutLat = null,
                               CheckOutLong = null,
                               ProductionHours = 0,
                               BreakHours = 0,
                               Overtime = 0
                           });
                       }
                   }
               }

               // เรียงลำดับตามวันที่และ EmployeeId
               result = result
                   .OrderBy(x => x.WorkDate)
                   .ThenBy(x => x.EmployeeId)
                   .ToList();

               return Ok(result);
           }
           catch (Exception ex)
           {
               return StatusCode(500, ex.Message);
           }
        }

        private static double CalculateProductionHours(DateTime? checkInTime, DateTime? checkOutTime, DateTime? breakStartTime, DateTime? breakEndTime)
        {
            if (!checkInTime.HasValue || !checkOutTime.HasValue)
            {
                return 0; // ถ้าไม่มีเวลาเข้า-ออก ให้คืนค่าเป็น 0
            }

            TimeSpan totalWorkedTime = checkOutTime.Value - checkInTime.Value;
            TimeSpan breakTime = TimeSpan.Zero;

            if (breakStartTime.HasValue && breakEndTime.HasValue && breakEndTime > breakStartTime)
            {
                breakTime = breakEndTime.Value - breakStartTime.Value;
            }

            TimeSpan productionTime = totalWorkedTime - breakTime;
            return productionTime.TotalMinutes / 60; // แปลงนาทีเป็นชั่วโมง
        }


        private static double CalculateBreakHours(DateTime? breakStartTime, DateTime? breakEndTime)
        {
            if (breakStartTime.HasValue && breakEndTime.HasValue)
            {
                return (breakEndTime.Value - breakStartTime.Value).TotalHours;
            }

            return 0; // No break hours if either time is missing
        }

        private static double CalculateOvertime(DateTime? checkInTime, DateTime? checkOutTime)
        {
            if (checkInTime.HasValue && checkOutTime.HasValue)
            {
                var totalHours = (checkOutTime.Value - checkInTime.Value).TotalHours;
                return totalHours > 8 ? totalHours - 8 : 0; // Calculate overtime if total hours exceed 8
            }

            return 0; // No overtime if either time is missing
        }
        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            // Haversine formula to calculate distance between two coordinates
            var R = 6371e3; // Radius of the Earth in meters
            var lat1Rad = lat1 * (Math.PI / 180); // Convert latitude to radians
            var lat2Rad = lat2 * (Math.PI / 180);
            var deltaLat = (lat2 - lat1) * (Math.PI / 180);
            var deltaLon = (lon2 - lon1) * (Math.PI / 180);

            var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                    Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
                    Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            var distance = R * c; // Distance in meters
            return distance;
        }

        public class RawAttendanceDto
        {
            public int? EmployeeId { get; set; }
            public int? CheckInId { get; set; }

            public DateTime WorkDate { get; set; }

            public DateTime? CheckInTime { get; set; }
            public DateTime? CheckOutTime { get; set; }
            public DateTime? BreakStartTime { get; set; }
            public DateTime? BreakEndTime { get; set; }
            public double? CheckInLat { get; set; }
            public double? CheckInLong { get; set; }
            public double? CheckOutLat { get; set; }
            public double? CheckOutLong { get; set; }
            public string? EmployeeCode { get; set; }
            public string? EmployeeName { get; set; }

            public int? OrganizationId { get; set; }
            public string? OrganizationCode { get; set; }
            public string? OrganizationName { get; set; }
            public string? SpecialTitle { get; set; }

            public int? DepartmentId { get; set; }
            public string? DepartmentName { get; set; }

            public string? LeaveReason { get; set; }
            public bool? IsLeave { get; set; }
        }

    }
}

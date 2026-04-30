using Attendance_Server.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Newtonsoft.Json;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Attendance_Server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class CheckInController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILoggingService _loggingService;
        private readonly SystemConfigService _configService;
        public CheckInController(ApplicationDbContext context, ILoggingService loggingService, SystemConfigService configService)
        {
            _context = context;
            _loggingService = loggingService;
            _configService = configService;
        }
        public class LogCheckInOutRequest
        {
            public int EmployeeId { get; set; }
            public double CurrentLat { get; set; }
            public double CurrentLon { get; set; }
            public string? Username { get; set; }
            public string? Status { get; set; }
        }
        // Punch In or Out
        [HttpPost("log-check-in-out")]
        public async Task<IActionResult> LogCheckInOut([FromBody] LogCheckInOutRequest request)
        {
            try
            {
                var maxDistanceKm = await _configService.GetDoubleAsync("CHECKIN_MAX_DISTANCE_KM");
                var distanceMode = await _configService.GetStringAsync("CHECKIN_DISTANCE_MODE");

                if (maxDistanceKm <= 0 || maxDistanceKm > 1000)
                    maxDistanceKm = 1;

                double allowedRadiusMeters = maxDistanceKm * 1000;

                double? baseLat = null;
                double? baseLon = null;

                if (distanceMode == "COMPANY")
                {
                    var companyLatStr = await _configService.GetStringAsync("COMPANY_LATITUDE");
                    var companyLonStr = await _configService.GetStringAsync("COMPANY_LONGITUDE");

                    if (double.TryParse(companyLatStr, out var lat) &&
                        double.TryParse(companyLonStr, out var lon))
                    {
                        baseLat = lat;
                        baseLon = lon;
                    }
                }
                else if (distanceMode == "CHECKIN_POINT")
                {
                    var firstCheckIn = await _context.CheckIns
                        .Where(x => x.EmployeeId == request.EmployeeId)
                        .OrderBy(x => x.CreateDate)
                        .FirstOrDefaultAsync();

                    if (firstCheckIn?.CheckInLat != null &&
                        firstCheckIn?.CheckInLong != null)
                    {
                        baseLat = firstCheckIn.CheckInLat.Value;
                        baseLon = firstCheckIn.CheckInLong.Value;
                    }
                }

                // ตรวจระยะเฉพาะเมื่อมี base location
                if (baseLat.HasValue && baseLon.HasValue)
                {
                    var distance = CalculateDistance(
                        baseLat.Value,
                        baseLon.Value,
                        request.CurrentLat,
                        request.CurrentLon);

                    if (distance > allowedRadiusMeters)
                    {
                        return BadRequest(new
                        {
                            message = $"Out of allowed range. Max {maxDistanceKm} km."
                        });
                    }
                }

                // Prevent double click within 5 seconds for same employee to prevent racing condition duplicates
                var lastPunch = await _context.CheckIns
                    .Where(x => x.EmployeeId == request.EmployeeId && x.CheckInTime.HasValue && x.CheckInTime.Value.Date == DateTime.UtcNow.Date)
                    .OrderByDescending(x => x.CheckInId)
                    .FirstOrDefaultAsync();

                if (lastPunch != null && lastPunch.CreateDate.HasValue)
                {
                    var timeSinceLast = (DateTime.UtcNow - lastPunch.CreateDate.Value.ToUniversalTime()).TotalSeconds;
                    if (timeSinceLast < 5)
                    {
                        return Ok(new { message = "Duplicate punch ignored to prevent double entry." });
                    }
                }

                // ✅ ถ้าไม่มี base location → ปล่อยผ่านได้
                var result = await _context.LogCheckInOutResults
                    .FromSqlRaw(
                        "SELECT \"solution-one\".\"hr-fn-check-in-out\"({0}, {1}, {2}, {3}, {4}) AS Message",
                        request.EmployeeId,
                        request.Username,
                        request.CurrentLat,
                        request.CurrentLon,
                        request.Status)
                    .ToListAsync();

                return Ok(result.FirstOrDefault());
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "LogCheckInOut", request.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpGet("{employeeId}")]
        public async Task<IActionResult> GetTimesheet(int employeeId)
        {
            try
            {
                var today = DateTime.UtcNow.Date; // เก็บวันปัจจุบันใน UTC

                var checkIns = await _context.CheckIns
                    .Where(c => c.EmployeeId == employeeId && c.CheckInTime.HasValue && c.CheckInTime.Value.Date == today)
                    .Select(c => new
                    {
                        c.CheckInId,
                        c.EmployeeId,
                        CheckInTime = c.CheckInTime.HasValue ? c.CheckInTime : null,
                        CheckOutTime = c.CheckOutTime.HasValue ? c.CheckOutTime : null,
                        //BreakStartTime = c.BreakStartTime.HasValue ? c.BreakStartTime : null,
                        //BreakEndTime = c.BreakEndTime.HasValue ? c.BreakEndTime : null,
                        //// คำนวณเวลาพักรวมเป็นชั่วโมง
                        //BreakDuration = c.BreakStartTime.HasValue && c.BreakEndTime.HasValue
                        //    ? Math.Round((c.BreakEndTime.Value - c.BreakStartTime.Value).TotalHours, 2)
                        //    : (double?)null,
                        CreateDate = c.CreateDate,
                        CreateBy = c.CreateBy,
                        UpdateDate = c.UpdateDate,
                        UpdateBy = c.UpdateBy,
                        CheckInLat = c.CheckInLat,
                        CheckInLong = c.CheckInLong,
                        CheckOutLat = c.CheckOutLat,
                        CheckOutLong = c.CheckOutLong
                    })
                    .FirstOrDefaultAsync();

                // หากไม่พบข้อมูลในวันปัจจุบัน ให้คืนค่า null
                if (checkIns == null)
                {
                    return Ok(new
                    {
                        CheckInTime = (DateTime?)null,
                        CheckOutTime = (DateTime?)null,
                        //BreakStartTime = (DateTime?)null,
                        //BreakEndTime = (DateTime?)null,
                        //BreakDuration = (double?)null,
                        OvertimeDuration = (double?)null, // เพิ่ม OvertimeDuration เป็น null
                        CheckInLat = (double?)null,
                        CheckInLong = (double?)null,
                        CheckOutLat = (double?)null,
                        CheckOutLong = (double?)null
                    });
                }
                double? overtimeDuration = null;
                if (checkIns.CheckOutTime.HasValue && checkIns.CheckOutTime.Value.TimeOfDay > new TimeSpan(18, 30, 0))
                {
                    var overtimeStart = checkIns.CheckOutTime.Value.Date.Add(new TimeSpan(18, 30, 0));
                    overtimeDuration = Math.Round((checkIns.CheckOutTime.Value - overtimeStart).TotalHours, 2);
                }
                return Ok(new
                {
                    checkIns.CheckInId,
                    checkIns.EmployeeId,
                    checkIns.CheckInTime,
                    checkIns.CheckOutTime,
                    //checkIns.BreakStartTime,
                    //checkIns.BreakEndTime,
                    //checkIns.BreakDuration,
                    checkIns.CreateDate,
                    checkIns.CreateBy,
                    checkIns.UpdateDate,
                    checkIns.UpdateBy,
                    OvertimeDuration = overtimeDuration,
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
                        //BreakStartTime = c.BreakStartTime.HasValue ? c.BreakStartTime : null,
                        //BreakEndTime = c.BreakEndTime.HasValue ? c.BreakEndTime : null,
                    })
                    .FirstOrDefaultAsync();

                if (checkInOutStatus == null)
                {
                    // No check-in record found, return status for Punch In
                    return Ok(new { status = "punch-in" });
                }
                else if (checkInOutStatus.CheckOutTime == null)
                {
                    //if (checkInOutStatus.BreakStartTime == null)
                    //{
                    //    // Check-in found, no break yet, return status for Start Break
                    //    return Ok(new { status = "start-break" });
                    //}
                    //else if (checkInOutStatus.BreakEndTime == null)
                    //{
                    //    // Break started but not ended, return status for End Break
                    //    return Ok(new { status = "end-break" });
                    //}
                    //else
                    //{
                        // Break ended, return status for Punch Out
                        return Ok(new { status = "punch-out" });
                    //}
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
            // if (activities.Count == 0)
            // {
            //     return NotFound(new { message = "No activities found for today." });
            // }

            return Ok(activities);
        }

        [HttpGet("work-stats/{employeeId}")]
        public async Task<IActionResult> GetWorkStatistics(int employeeId)
        {
            var today = DateTime.UtcNow.Date;
            var weekStart = today.AddDays(-(int)today.DayOfWeek);
            var monthStart = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            async Task<double> CalculateTotalHoursWorked(DateTime start, DateTime end)
            {
                return await _context.CheckIns
                    .Where(c => c.EmployeeId == employeeId
                                && c.CheckInTime.HasValue
                                && c.CheckInTime.Value >= start
                                && c.CheckInTime.Value < end)
                    .Select(c =>
                        c.CheckOutTime.HasValue
                            ? (
                                (c.CheckOutTime.Value.ToUniversalTime() - c.CheckInTime.Value.ToUniversalTime())
                                - (
                                    c.BreakStartTime.HasValue && c.BreakEndTime.HasValue
                                        ? (c.BreakEndTime.Value.ToUniversalTime() - c.BreakStartTime.Value.ToUniversalTime())
                                        : TimeSpan.Zero
                                  )
                              ).TotalHours
                            : 0
                    )
                    .SumAsync();
            }

            // Today
            var todayHours = await CalculateTotalHoursWorked(today, today.AddDays(1));

            // Week
            var weekHours = await CalculateTotalHoursWorked(weekStart, today.AddDays(1));

            // Month
            var monthHours = await CalculateTotalHoursWorked(monthStart, today.AddDays(1));

            const double dailyTarget = 8;
            const double weeklyTarget = 40;
            const double monthlyTarget = 160;

            var stats = new
            {
                Today = Math.Round(todayHours, 2),
                TodayPercentage = Math.Round((todayHours / dailyTarget) * 100, 2),

                ThisWeek = Math.Round(weekHours, 2),
                WeekPercentage = Math.Round((weekHours / weeklyTarget) * 100, 2),

                ThisMonth = Math.Round(monthHours, 2),
                MonthPercentage = Math.Round((monthHours / monthlyTarget) * 100, 2),

                Remaining = Math.Round(Math.Max(monthlyTarget - monthHours, 0), 2),
                Overtime = Math.Round(Math.Max(monthHours - monthlyTarget, 0), 2)
            };

            return Ok(stats);
        }

        public class CheckInResponse
        {
            public int CheckInId { get; set; }
            public int EmployeeId { get; set; }
            public DateTime? CheckInTime { get; set; }
            public DateTime? CheckOutTime { get; set; }
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

            var distinctCheckIns = checkIns
                .GroupBy(x => x.CheckInTime?.ToString("yyyy-MM-dd HH:mm"))
                .Select(g => g.First())
                .OrderByDescending(x => x.CheckInTime)
                .ToList();

            return Ok(distinctCheckIns);
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

            var distinctCheckIns = checkIns
                .GroupBy(x => x.CheckInTime?.ToString("yyyy-MM-dd HH:mm"))
                .Select(g => g.First())
                .OrderByDescending(x => x.CheckInTime)
                .ToList();

            return Ok(distinctCheckIns);
        }

        public class CheckInSearchRequest
        {
            public DateTime? SelectedDate { get; set; }
            public int? SelectedMonth { get; set; }
            public int? SelectedYear { get; set; }
            public int EmployeeId { get; set; } // Include EmployeeId for filtering
        }
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        [HttpGet("year")]
        public IActionResult GetYears()
        {
            try
            {
                int currentYear = DateTime.Now.Year;

                var years = Enumerable.Range(currentYear - 2, 3)
                                      .OrderByDescending(y => y);

                return Ok(years);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpPost("search")]
        public async Task<IActionResult> SearchCheckIns([FromBody] CheckInSearchRequest searchRequest)
        {
            var query = _context.CheckIns.AsQueryable();

            // Apply filtering based on search criteria
            if (searchRequest.EmployeeId > 0)
            {
                query = query.Where(c => c.EmployeeId == searchRequest.EmployeeId);
            }

            if (searchRequest.SelectedDate.HasValue)
            {
                query = query.Where(c => c.CheckInTime.HasValue && c.CheckInTime.Value.Date == searchRequest.SelectedDate.Value.Date);
            }

            if (searchRequest.SelectedMonth.HasValue && searchRequest.SelectedMonth != 0)
            {
                query = query.Where(c => c.CheckInTime.HasValue && c.CheckInTime.Value.Month == searchRequest.SelectedMonth.Value);
            }

            if (searchRequest.SelectedYear.HasValue)
            {
                query = query.Where(c => c.CheckInTime.HasValue && c.CheckInTime.Value.Year == searchRequest.SelectedYear.Value);
            }

            var rawData = await query
                            .Select(c => new
                            {
                                c.CheckInId,
                                c.EmployeeId,
                                c.CheckInTime,
                                c.CheckOutTime,
                                c.BreakStartTime,
                                c.BreakEndTime
                            })
                            .ToListAsync();

            var checkIns = rawData.Select(c => new CheckInResponse
                            {
                                CheckInId = c.CheckInId,
                                EmployeeId = c.EmployeeId,

                                CheckInTime = c.CheckInTime,
                                CheckOutTime = c.CheckOutTime,

                                ProductionHours = (c.CheckInTime.HasValue && c.CheckOutTime.HasValue)
                            ? Math.Round(
                                CalculateProductionHours(
                                    c.CheckInTime.Value,
                                    c.CheckOutTime.Value,
                                    c.BreakStartTime,
                                    c.BreakEndTime
                                ), 2)
                            : null,

                                BreakHours = (c.BreakStartTime.HasValue && c.BreakEndTime.HasValue)
                            ? Math.Round(
                                CalculateBreakHours(
                                    c.BreakStartTime.Value,
                                    c.BreakEndTime.Value
                                ), 2)
                            : null,

                                Overtime = (c.CheckInTime.HasValue && c.CheckOutTime.HasValue)
                            ? Math.Round(
                                CalculateOvertime(
                                    c.CheckInTime.Value,
                                    c.CheckOutTime.Value
                                ), 2)
                            : null
                            })
                            .GroupBy(x => x.CheckInTime?.ToString("yyyy-MM-dd HH:mm"))
                            .Select(g => g.First())
                            .OrderByDescending(x => x.CheckInTime.Value.Date).ToList();
            var response = new ApiResponse<CheckInResponse>
            {
                Data = checkIns,
                TotalData = checkIns.Count
            };
            return Ok(response);

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
    }
}

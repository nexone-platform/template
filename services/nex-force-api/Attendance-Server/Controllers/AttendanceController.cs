using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;

namespace Attendance_Server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AttendanceController(ApplicationDbContext context)
        {
            _context = context;
        }

/*        [HttpGet("{year}/{month}")]
        public async Task<IActionResult> GetAttendance(int year, int month, int? employeeId = null)
        {
            var employeesQuery = _context.Employees.AsQueryable();
            if (employeeId.HasValue)
            {
                employeesQuery = employeesQuery.Where(e => e.Id == employeeId.Value);
            }

            var employees = await employeesQuery.ToListAsync();
            var checkIns = await _context.CheckIns
                .Where(c => c.CheckInTime.Value.Year == year && c.CheckInTime.Value.Month == month)
                .ToListAsync();
            var leaves = await _context.LeaveRequests
                .Where(l => l.StartDate.Year == year && l.EndDate.Month == month)
                .ToListAsync();
            var holidays = await _context.Holidays
                .Where(h => h.HolidayDate.Year == year && h.HolidayDate.Month == month)
                .ToListAsync();
            var specialDays = await _context.SpecialWorkingDays
                .Where(s => s.SpecialDate.Year == year && s.SpecialDate.Month == month)
                .ToListAsync();

            var daysInMonth = DateTime.DaysInMonth(year, month);
            var attendanceData = employees.Select(e => new
            {
                EmployeeId = e.Id,
                Name = e.FirstNameEn + " " + e.LastNameEn,
                Attendance = Enumerable.Range(1, daysInMonth).Select(day =>
                {
                    var date = new DateTime(year, month, day);
                    var checkInData = checkIns
                        .Where(c => c.EmployeeId == e.Id && c.CheckInTime.Value.Date == date)
                        .OrderBy(c => c.CheckInTime)
                        .ToList();

                    var timeSlots = new List<object>();

                    // วันหยุดนักขัตฤกษ์
                    if (holidays.Any(h => h.HolidayDate.Date == date))
                    {
                        timeSlots.Add(new
                        {
                            dayNumber = day,
                            color = "#696969", // เทาสำหรับวันหยุดนักขัตฤกษ์
                            time = "H",
                            hour = 0
                        });
                    }

                    // วันทำงานพิเศษ
                    bool isSpecialDay = specialDays.Any(s => s.SpecialDate.Date == date);
                    if (isSpecialDay)
                    {
                        timeSlots.Add(new
                        {
                            dayNumber = day,
                            color = "#FFAF69", // ส้มสำหรับวันทำงานพิเศษ
                            time = "Sp Day",
                            hour = 0
                        });
                    }

                    // ตรวจสอบวันลา
                    if (leaves.Any(l => l.EmployeeId == e.Id && l.StartDate.Date <= date && l.EndDate.Date >= date))
                    {
                        timeSlots.Add(new
                        {
                            dayNumber = day,
                            color = "#FFC95D", // เหลืองสำหรับวันลา
                            time = "L",
                            hour = 0
                        });
                    }

                    // วันเสาร์-อาทิตย์ ที่ไม่มีวันทำงานพิเศษ → No Work (สีเทาอ่อน)
                    if ((date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                        && !isSpecialDay && !timeSlots.Any())
                    {
                        timeSlots.Add(new
                        {
                            dayNumber = day,
                            color = "#4D5154", // เทาอ่อนสำหรับเสาร์-อาทิตย์ปกติ
                            time = "H",
                            hour = 0
                        });
                    }

                    // วันจันทร์-ศุกร์ที่ไม่มีการทำงาน → No Work (สีแดง)
                    if ((date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
                        && !checkInData.Any() && !timeSlots.Any())
                    {
                        timeSlots.Add(new
                        {
                            dayNumber = day,
                            color = "#F74262", // แดงสำหรับวันจันทร์-ศุกร์ที่ไม่มีการทำงาน
                            time = "N/A",
                            hour = 0
                        });
                    }

                    // ถ้ามีข้อมูล Check-in
                    if (checkInData.Any())
                    {
                        var firstCheckIn = checkInData.First().CheckInTime.Value.TimeOfDay;
                        var lastCheckOut = checkInData.Last().CheckOutTime.HasValue
                            ? checkInData.Last().CheckOutTime.Value.TimeOfDay
                            : firstCheckIn;

                        // Morning shift (08:00 - 12:00)
                        if (firstCheckIn < new TimeSpan(12, 0, 0))
                        {
                            var morningStart = firstCheckIn < new TimeSpan(8, 0, 0) ? new TimeSpan(8, 0, 0) : firstCheckIn;
                            var morningEnd = lastCheckOut < new TimeSpan(12, 0, 0) ? lastCheckOut : new TimeSpan(12, 0, 0);
                            if (morningEnd > morningStart)
                            {
                                timeSlots.Add(new
                                {
                                    dayNumber = day,
                                    color = "#0000FF", // น้ำเงินสำหรับ Check-in
                                    time = $"{morningStart:hh\\:mm} - {morningEnd:hh\\:mm}",
                                    hour = (morningEnd - morningStart).TotalHours
                                });
                            }
                        }

                        // Afternoon shift (13:00 - 17:00)
                        if (lastCheckOut > new TimeSpan(13, 0, 0))
                        {
                            var afternoonStart = firstCheckIn > new TimeSpan(13, 0, 0) ? firstCheckIn : new TimeSpan(13, 0, 0);
                            var afternoonEnd = lastCheckOut < new TimeSpan(17, 0, 0) ? lastCheckOut : new TimeSpan(17, 0, 0);
                            if (afternoonEnd > afternoonStart)
                            {
                                timeSlots.Add(new
                                {
                                    dayNumber = day,
                                    color = "#0000FF", // น้ำเงินสำหรับ Check-in
                                    time = $"{afternoonStart:hh\\:mm} - {afternoonEnd:hh\\:mm}",
                                    hour = (afternoonEnd - afternoonStart).TotalHours
                                });
                            }
                        }

                        // Overtime after 17:00
                        if (lastCheckOut > new TimeSpan(17, 0, 0))
                        {
                            var otStart = new TimeSpan(17, 1, 0);
                            var otEnd = lastCheckOut;
                            timeSlots.Add(new
                            {
                                dayNumber = day,
                                color = "#66D373", // น้ำเงินเข้มสำหรับ OT
                                time = $"{otStart:hh\\:mm} - {otEnd:hh\\:mm}",
                                hour = (otEnd - otStart).TotalHours
                            });
                        }
                    }

                    return timeSlots;
                }).ToList()
            }).ToList();

            return Ok(attendanceData);
        }*/

        [HttpGet("{year}/{month}")]
        public async Task<IActionResult> GetAttendanceData(int year, int month, int? employeeId = null)
        {
            var employeesQuery = _context.Employees.AsQueryable();
            if (employeeId.HasValue)
            {
                employeesQuery = employeesQuery.Where(e => e.Id == employeeId.Value);
            }

            var employees = await employeesQuery.ToListAsync();
            var checkIns = await _context.CheckIns
                .Where(c => c.CheckInTime.Value.Year == year && c.CheckInTime.Value.Month == month)
                .ToListAsync();
            var timesheets = await _context.Timesheets
                .Where(t => t.WorkDate.Year == year && t.WorkDate.Month == month)
                .ToListAsync();
            var leaves = await _context.LeaveRequests
                .Where(l => l.StartDate.Year == year && l.EndDate.Month == month)
                .ToListAsync();
            var holidays = await _context.Holidays
                .Where(h => h.HolidayDate.Year == year && h.HolidayDate.Month == month)
                .ToListAsync();
            var specialDays = await _context.SpecialWorkingDays
                .Where(s => s.SpecialDate.Year == year && s.SpecialDate.Month == month)
                .ToListAsync();

            var daysInMonth = DateTime.DaysInMonth(year, month);
            var attendanceData = employees.Select(e => new
            {
                EmployeeId = e.Id,
                Name = e.FirstNameEn + " " + e.LastNameEn,
                Attendance = Enumerable.Range(1, daysInMonth).Select(day =>
                {
                    var date = new DateTime(year, month, day);
                    var checkInData = checkIns
                        .Where(c => c.EmployeeId == e.Id && c.CheckInTime.Value.Date == date)
                        .OrderBy(c => c.CheckInTime)
                        .ToList();

                    var timesheetData = timesheets
                        .Where(t => t.EmployeeId == e.Id && t.WorkDate.Date == date)
                        .ToList();

                    var timeSlots = new List<object>();

                    // วันหยุดนักขัตฤกษ์
                    if (holidays.Any(h => h.HolidayDate.Date == date))
                    {
                        timeSlots.Add(new { dayNumber = day, color = "#696969", time = "H", hour = 0 });
                    }

                    // วันทำงานพิเศษ
                    bool isSpecialDay = specialDays.Any(s => s.SpecialDate.Date == date);
                    if (isSpecialDay)
                    {
                        timeSlots.Add(new { dayNumber = day, color = "#FFAF69", time = "Sp Day", hour = 0 });
                    }

                    // ตรวจสอบวันลา
                    if (leaves.Any(l => l.EmployeeId == e.Id && l.StartDate.Date <= date && l.EndDate.Date >= date))
                    {
                        timeSlots.Add(new { dayNumber = day, color = "#FFC95D", time = "L", hour = 0 });
                    }

                    // วันเสาร์-อาทิตย์ ที่ไม่มีวันทำงานพิเศษ → No Work (สีเทาอ่อน)
                    if ((date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                        && !isSpecialDay && !timeSlots.Any())
                    {
                        timeSlots.Add(new { dayNumber = day, color = "#4D5154", time = "H", hour = 0 });
                    }

                    // วันจันทร์-ศุกร์ที่ไม่มีการทำงาน → No Work (สีแดง)
                    if ((date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
                        && !checkInData.Any() && !timeSlots.Any())
                    {
                        timeSlots.Add(new { dayNumber = day, color = "#F74262", time = "N/A", hour = 0 });
                    }

                    // ถ้ามีข้อมูล Check-in
                    if (checkInData.Any())
                    {
                        var firstCheckIn = checkInData.First().CheckInTime.Value.TimeOfDay;
                        var lastCheckOut = checkInData.Last().CheckOutTime.HasValue
                            ? checkInData.Last().CheckOutTime.Value.TimeOfDay
                            : firstCheckIn;

                        // เชื่อมโยง Timesheet กับ Check-in
                        var timesheetJobType = timesheetData.FirstOrDefault()?.JobType?? null;

                        // Morning shift (08:00 - 12:00)
                        if (firstCheckIn < new TimeSpan(12, 0, 0))
                        {
                            var morningStart = firstCheckIn < new TimeSpan(8, 0, 0) ? new TimeSpan(8, 0, 0) : firstCheckIn;
                            var morningEnd = lastCheckOut < new TimeSpan(12, 0, 0) ? lastCheckOut : new TimeSpan(12, 0, 0);
                            if (morningEnd > morningStart)
                            {
                                timeSlots.Add(new
                                {
                                    dayNumber = day,
                                    color = "#0000FF", // น้ำเงินสำหรับ Check-in
                                    time = $"{timesheetJobType} - {morningStart:hh\\:mm} - {morningEnd:hh\\:mm}",
                                    hour = (morningEnd - morningStart).TotalHours
                                });
                            }
                        }

                        // Afternoon shift (13:00 - 17:00)
                        if (lastCheckOut > new TimeSpan(13, 0, 0))
                        {
                            var afternoonStart = firstCheckIn > new TimeSpan(13, 0, 0) ? firstCheckIn : new TimeSpan(13, 0, 0);
                            var afternoonEnd = lastCheckOut < new TimeSpan(17, 0, 0) ? lastCheckOut : new TimeSpan(17, 0, 0);
                            if (afternoonEnd > afternoonStart)
                            {

                                if (!string.IsNullOrEmpty(timesheetJobType))
                                {
                                    timeSlots.Add(new
                                    {
                                        dayNumber = day,
                                        color = "#0000FF", // น้ำเงินสำหรับ Check-in
                                        time = $"{timesheetJobType} - {afternoonStart:hh\\:mm} - {afternoonEnd:hh\\:mm}",
                                        hour = (afternoonEnd - afternoonStart).TotalHours
                                    });
                                }
                                else
                                {
                                    timeSlots.Add(new
                                    {

                                        dayNumber = day,
                                        color = "#0000FF", // น้ำเงินสำหรับ Check-in
                                        time = $"{afternoonStart:hh\\:mm} - {afternoonEnd:hh\\:mm}",
                                        hour = (afternoonEnd - afternoonStart).TotalHours
                                    });
                                }
                            }
                        }

                        // Overtime after 17:00
                        if (lastCheckOut > new TimeSpan(17, 0, 0))
                        {
                            var otStart = new TimeSpan(17, 1, 0);
                            var otEnd = lastCheckOut;
                            if (!string.IsNullOrEmpty(timesheetJobType))
                            {
                                timeSlots.Add(new
                                {
                                    dayNumber = day,
                                    color = "#66D373", // สีเขียวสำหรับ OT
                                    time = $"{timesheetJobType} - {otStart:hh\\:mm} - {otEnd:hh\\:mm}",
                                    hour = (otEnd - otStart).TotalHours
                                });
                            }
                            else
                            {
                                timeSlots.Add(new
                                {
                                    dayNumber = day,
                                    color = "#66D373", // สีเขียวสำหรับ OT
                                    time = $"{otStart:hh\\:mm} - {otEnd:hh\\:mm}",
                                    hour = (otEnd - otStart).TotalHours
                                });
                            }
                        }
                    }

                    return timeSlots;
                }).ToList()
            }).ToList();

            return Ok(attendanceData);
        }

    }

}

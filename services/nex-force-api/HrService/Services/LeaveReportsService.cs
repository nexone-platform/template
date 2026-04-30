
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using static Middlewares.Constant.StatusConstant;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace HrService.Services
{
    public class LeaveReportsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;


        public LeaveReportsService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;
        }

        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        public async Task<List<LeaveAvailableResponseDto>> GetAvailableLeaveQuotaAsync( int year, string lang)
        {

            var allLeaveTypes = await _context.LeaveTypes.ToListAsync();

            var leaveQuotas = await _context.LeaveQuotas
                                 .Where(lq =>  lq.Year == year)
                                 .Include(lq => lq.LeaveType)
                                 .ToListAsync();

            var usedLeaves = await _context.LeaveRequests
                                .Where(lr =>  lr.Status == ApproveStatus.Approved.ToString() && lr.StartDate.Year == year)
                                .GroupBy(lr => lr.LeaveTypeId)
                                .Select(g => new {
                                    LeaveTypeId = g.Key,
                                    UsedDays = g.Sum(lr => lr.TotalDays)
                                })
                                .ToDictionaryAsync(x => x.LeaveTypeId, x => x.UsedDays);

            var response = new List<LeaveAvailableResponseDto>();

            foreach (var leaveType in allLeaveTypes)
            {
                var quota = leaveQuotas.FirstOrDefault(q => q.LeaveTypeId == leaveType.LeaveTypeId);
                var usedDays = usedLeaves.ContainsKey(leaveType.LeaveTypeId) ? usedLeaves[leaveType.LeaveTypeId] : 0;

                response.Add(new LeaveAvailableResponseDto
                {

                    LeaveTypeId = leaveType.LeaveTypeId,
                    TotalQuota = quota?.Quota ?? 0,
                    UsedLeaveDays = usedDays,
                    AvailableQuota = (quota?.Quota ?? 0) - usedDays,
                    LeaveTypeName = lang == "th" ? leaveType.LeaveTypeNameTh : leaveType.LeaveTypeNameEn
                });
            }

            return response;
        }

        public class LeaveAvailableResponseDto
        {
            public decimal EmployeeId { get; set; }
            public int LeaveTypeId { get; set; }
            public decimal TotalQuota { get; set; }
            public decimal UsedLeaveDays { get; set; }
            public decimal AvailableQuota { get; set; }
            public string? LeaveTypeName { get; set; }
        }

        public async Task<List<LeaveDetailResponseDto>> GetAvailableLeaveAsync(int year, string lang)
        {
            // ดึงข้อมูลพนักงานพร้อมแผนกแบบ join
            var employees = await (from e in _context.Employees
                                   join d in _context.Departments on e.DepartmentId equals d.DepartmentId into dept
                                   from d in dept.DefaultIfEmpty()
                                   select new
                                   {
                                       e.Id,
                                       FullName = e.FirstNameEn,
                                       DepartmentName = d != null ? d.DepartmentNameTh : "-"
                                   }).ToListAsync();

            // ดึงข้อมูลประเภทวันลา
            var leaveTypes = await _context.LeaveTypes.ToListAsync();

            // ดึงข้อมูล quota ของปีนั้น
            var leaveQuotas = await _context.LeaveQuotas
                                    .Where(lq => lq.Year == year)
                                    .ToListAsync();

            // ดึงข้อมูลวันลาที่อนุมัติแล้วในปีนั้น
            var leaveRequests = await _context.LeaveRequests
                                        .Where(lr => lr.Status == ApproveStatus.Approved.ToString() && lr.StartDate.Year == year)
                                        .ToListAsync();

            var response = new List<LeaveDetailResponseDto>();

            foreach (var employee in employees)
            {
                foreach (var leaveType in leaveTypes)
                {
                    var quota = leaveQuotas.FirstOrDefault(q => q.EmployeeId == employee.Id && q.LeaveTypeId == leaveType.LeaveTypeId);

                    var leavesTaken = leaveRequests
                                      .Where(lr => lr.EmployeeId == employee.Id && lr.LeaveTypeId == leaveType.LeaveTypeId)
                                      .ToList();

                    decimal totalLeaveTaken = leavesTaken.Sum(lr => lr.TotalDays);
                    decimal totalQuota = quota?.Quota ?? 0;
                    decimal remainingLeave = totalQuota - totalLeaveTaken;
                    decimal carryForward = quota?.CarryForward ?? 0;

                    foreach (var leave in leavesTaken)
                    {
                        response.Add(new LeaveDetailResponseDto
                        {
                            EmployeeId = employee.Id,
                            EmployeeName = employee.FullName,
                            DepartmentName = employee.DepartmentName,
                            LeaveTypeName = lang == "th" ? leaveType.LeaveTypeNameTh : leaveType.LeaveTypeNameEn,
                            Date = leave.StartDate,
                            NoOfDays = (int)leave.TotalDays,
                            RemainingLeave = remainingLeave,
                            TotalLeaves = totalQuota,
                            TotalLeaveTaken = totalLeaveTaken,
                            LeaveCarryForward = carryForward
                        });
                    }

                    if (!leavesTaken.Any())
                    {
                        response.Add(new LeaveDetailResponseDto
                        {
                            EmployeeId = employee.Id,
                            EmployeeName = employee.FullName,
                            DepartmentName = employee.DepartmentName,
                            LeaveTypeName = lang == "th" ? leaveType.LeaveTypeNameTh : leaveType.LeaveTypeNameEn,
                            Date = null,
                            NoOfDays = 0,
                            RemainingLeave = remainingLeave,
                            TotalLeaves = totalQuota,
                            TotalLeaveTaken = totalLeaveTaken,
                            LeaveCarryForward = carryForward
                        });
                    }
                }
            }

            return response;
        }
        public class LeaveDetailResponseDto
        {
            public decimal EmployeeId { get; set; }
            public string EmployeeCode { get; set; }
            public string EmployeeName { get; set; }
            public string DepartmentName { get; set; }
            public string LeaveTypeName { get; set; }
            public DateTime? Date { get; set; }
            public int NoOfDays { get; set; }
            public decimal RemainingLeave { get; set; }
            public decimal TotalLeaves { get; set; }
            public decimal TotalLeaveTaken { get; set; }
            public decimal LeaveCarryForward { get; set; }
            public int? Year { get; set; }
        }
        public class LeaveSearchCriteriaDto
        {
            public int Year { get; set; }
            public string Lang { get; set; } = "en";
            public int? EmployeeId { get; set; }
            public int? DepartmentId { get; set; }
            public int? LeaveTypeId { get; set; }
        }


        public async Task<List<LeaveDetailResponseDto>> GetSearchAvailableLeaveAsync(LeaveSearchCriteriaDto criteria)
        {
            var year = criteria.Year != 0 ? criteria.Year : DateTime.Now.Year;
            var lang = criteria.Lang ?? "en";

            // ดึงข้อมูลพนักงานพร้อมแผนกแบบ join และกรองตาม department / employee
            var employeesQuery =
                from e in _context.Employees
                join d in _context.Departments on e.DepartmentId equals d.DepartmentId into dept
                from d in dept.DefaultIfEmpty()
                select new
                {
                    e.Id,
                    EmployeeCode = e.EmployeeId,
                    FullName = lang == "th"
                                ? (e.FirstNameTh + " " + e.LastNameTh)
                                : (e.FirstNameEn + " " + e.LastNameEn),
                    DepartmentId = e.DepartmentId,
                    DepartmentName = d != null
                                ? (lang == "th" ? d.DepartmentNameTh : d.DepartmentNameEn)
                                : "-"
                };

            if (criteria.EmployeeId.HasValue)
                employeesQuery = employeesQuery.Where(e => e.Id == criteria.EmployeeId.Value);

            if (criteria.DepartmentId.HasValue)
                employeesQuery = employeesQuery.Where(e => e.DepartmentId == criteria.DepartmentId.Value);

            var employees = await employeesQuery.ToListAsync();

            // ดึงข้อมูลประเภทวันลา
            var leaveTypesQuery = _context.LeaveTypes.AsQueryable();
            if (criteria.LeaveTypeId.HasValue)
                leaveTypesQuery = leaveTypesQuery.Where(lt => lt.LeaveTypeId == criteria.LeaveTypeId.Value);

            var leaveTypes = await leaveTypesQuery.ToListAsync();

            // ดึงข้อมูล quota ของปีนั้น
            var leaveQuotas = await _context.LeaveQuotas
                                    .Where(lq => lq.Year == year)
                                    .ToListAsync();

            // ดึงข้อมูลวันลาที่อนุมัติแล้วในปีนั้น
            var leaveRequestsQuery = _context.LeaveRequests
                .Where(lr => lr.Status == ApproveStatus.Approved.ToString()
                          && lr.StartDate.Year == year);

            // ✅ เพิ่มการกรอง LeaveTypeId
            if (criteria.LeaveTypeId.HasValue)
                leaveRequestsQuery = leaveRequestsQuery.Where(lr => lr.LeaveTypeId == criteria.LeaveTypeId.Value);

            var leaveRequests = await leaveRequestsQuery.ToListAsync();

            var response = new List<LeaveDetailResponseDto>();

            foreach (var employee in employees)
            {
                foreach (var leaveType in leaveTypes)
                {
                    var quota = leaveQuotas.FirstOrDefault(q =>
                        q.EmployeeId == employee.Id && q.LeaveTypeId == leaveType.LeaveTypeId);

                    var leavesTaken = leaveRequests
                        .Where(lr => lr.EmployeeId == employee.Id && lr.LeaveTypeId == leaveType.LeaveTypeId)
                        .ToList();

                    decimal totalLeaveTaken = leavesTaken.Sum(lr => lr.TotalDays);
                    decimal totalQuota = quota?.Quota ?? 0;
                    decimal remainingLeave = totalQuota - totalLeaveTaken;
                    decimal carryForward = quota?.CarryForward ?? 0;

                    foreach (var leave in leavesTaken)
                    {
                        response.Add(new LeaveDetailResponseDto
                        {
                            EmployeeId = employee.Id,
                            EmployeeName = employee.FullName,
                            DepartmentName = employee.DepartmentName,
                            LeaveTypeName = lang == "th" ? leaveType.LeaveTypeNameTh : leaveType.LeaveTypeNameEn,
                            Date = leave.StartDate,
                            NoOfDays = (int)leave.TotalDays,
                            RemainingLeave = remainingLeave,
                            TotalLeaves = totalQuota,
                            TotalLeaveTaken = totalLeaveTaken,
                            LeaveCarryForward = carryForward,
                            EmployeeCode = employee.EmployeeCode,
                            Year = year
                        });
                    }

                    if (!leavesTaken.Any())
                    {
                        response.Add(new LeaveDetailResponseDto
                        {
                            EmployeeId = employee.Id,
                            EmployeeName = employee.FullName,
                            DepartmentName = employee.DepartmentName,
                            LeaveTypeName = lang == "th" ? leaveType.LeaveTypeNameTh : leaveType.LeaveTypeNameEn,
                            Date = null,
                            NoOfDays = 0,
                            RemainingLeave = remainingLeave,
                            TotalLeaves = totalQuota,
                            TotalLeaveTaken = totalLeaveTaken,
                            LeaveCarryForward = carryForward,
                            EmployeeCode = employee.EmployeeCode,
                            Year = year
                        });
                    }
                }
            }

            return response;
        }

    }
}

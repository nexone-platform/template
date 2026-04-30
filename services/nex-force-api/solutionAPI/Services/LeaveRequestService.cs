using Azure.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Helpers;
using Middlewares.Models;
using static Middlewares.Constant.StatusConstant;
using static solutionAPI.Services.LeaveRequestService;
using static System.Net.WebRequestMethods;
namespace solutionAPI.Services
{
    public class LeaveRequestService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly IServiceProvider _serviceProvider;
        private readonly EmailService _emailService;
        public LeaveRequestService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor, ILoggingService loggingService, IServiceProvider serviceProvider, EmailService emailService)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _loggingService = loggingService;
            _serviceProvider = serviceProvider;
            _emailService = emailService;
        }

        public class LeaveResponseDto
        {
            public int LeaveRequestId { get; set; }
            public decimal EmployeeId { get; set; }
            public string? EmployeeName { get; set; }
            public int LeaveTypeId { get; set; }
            public string? LeaveTypeName { get; set; }
            public string? Comments { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
            public decimal TotalDays { get; set; }
            public string? Reason { get; set; }
            public DateTime? RequestDate { get; set; }
            public DateTime? ApprovedDate { get; set; }
            public decimal? ApprovalId { get; set; }
            public string? ApproverName { get; set; }
            public string? Status { get; set; }
            public string? DayType { get; set; }
            public string? ImgPath { get; set; }
            public string? ApproverImgPath { get; set; }
        }
        public class LeaveRequestResponseDto
        {
            public int LeaveRequestId { get; set; }
            public decimal EmployeeId { get; set; }
            public string? EmployeeName { get; set; }
            public int LeaveTypeId { get; set; }
            public string? LeaveTypeName { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
            public decimal TotalDays { get; set; }
            public string? Reason { get; set; }
            public DateTime? RequestDate { get; set; }
            public string? Status { get; set; }
            public string? DayType { get; set; }
            public decimal? ApproverId { get; set; }
            public DateTime? ApprovedDate { get; set; }
            public string? ApproverName { get; set; }
            public string? ApproverImgPath { get; set; }
            public string? Comments { get; set; }
        }
        public class LeaveRequestDto
        {
            public int LeaveRequestId { get; set; }
            public decimal EmployeeId { get; set; }
            public int LeaveTypeId { get; set; }
            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
            public decimal TotalDays { get; set; }
            public string? Reason { get; set; }
            public string? DayType { get; set; } // e.g., "full" or "half"
            public string? Username { get; set; }
        }



        public async Task<LeaveRequest> SaveOrUpdateLeaveRequestAsync(
      LeaveRequestDto dto,
      string currentUser)
        {
            try
            {
                // 1️⃣ Load employee (ครั้งเดียว)
                var employee = await _context.Employees
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e => e.Id == dto.EmployeeId);

                if (employee == null)
                    throw new Exception("Employee not found.");

                var year = dto.StartDate.Year;
                var leaveTypeId = dto.LeaveTypeId;

                // 2️⃣ Load RefId (ครั้งเดียว ใช้ทั้ง create/update)
                var refId = await _context.ApprovalReferences
                    .Where(r => EF.Functions.ILike(r.RefType, "leave"))
                    .Select(r => r.RefId)
                    .FirstOrDefaultAsync();

                // 3️⃣ Load LeaveQuota
                var leaveQuota = await _context.LeaveQuotas
                    .Where(lq => lq.EmployeeId == dto.EmployeeId
                              && lq.Year == year
                              && lq.LeaveTypeId == leaveTypeId)
                    .Select(lq => lq.Quota)
                    .FirstOrDefaultAsync();

                // 4️⃣ Calculate used days
                var usedDays = await _context.LeaveRequests
                    .Where(lr =>
                        lr.EmployeeId == dto.EmployeeId &&
                        lr.LeaveTypeId == leaveTypeId &&
                        lr.Status == ApproveStatus.Approved.ToString() &&
                        lr.StartDate.Year == year &&
                        lr.LeaveRequestId != dto.LeaveRequestId)
                    .SumAsync(lr => (decimal?)lr.TotalDays) ?? 0;

                var remaining = leaveQuota - usedDays;

                if (remaining <= 0)
                    throw new Exception("Leave cannot be requested because remaining leave days are zero.");

                // 5️⃣ Overlap check (ใช้ AnyAsync)
                var hasOverlap = await _context.LeaveRequests.AnyAsync(lr =>
                    lr.EmployeeId == dto.EmployeeId &&
                    lr.Status != ApproveStatus.Declined.ToString() &&
                    lr.LeaveRequestId != dto.LeaveRequestId &&
                    (
                        (dto.StartDate >= lr.StartDate && dto.StartDate <= lr.EndDate) ||
                        (dto.EndDate >= lr.StartDate && dto.EndDate <= lr.EndDate) ||
                        (dto.StartDate <= lr.StartDate && dto.EndDate >= lr.EndDate)
                    ) &&
                    (dto.StartDate.Date != lr.StartDate.Date || dto.DayType == lr.DayType)
                );

                if (hasOverlap)
                    throw new Exception("Leave request period overlaps with an existing leave request.");

                LeaveRequest leaveRequest;

                // ================= UPDATE =================
                if (dto.LeaveRequestId > 0)
                {
                    leaveRequest = await _context.LeaveRequests
                        .FirstOrDefaultAsync(lr => lr.LeaveRequestId == dto.LeaveRequestId);

                    if (leaveRequest == null)
                        throw new Exception("Leave request not found.");

                    leaveRequest.LeaveTypeId = dto.LeaveTypeId;
                    leaveRequest.StartDate = dto.StartDate;
                    leaveRequest.EndDate = dto.EndDate;
                    leaveRequest.TotalDays = dto.TotalDays;
                    leaveRequest.Reason = dto.Reason;
                    leaveRequest.DayType = dto.DayType;
                    leaveRequest.RefId = refId;
                    leaveRequest.UpdateDate = DateTime.UtcNow;
                    leaveRequest.UpdateBy = currentUser;
                    leaveRequest.ApproverId = null;

                    var approvalStatus = await _context.ApprovalStatuses
                        .FirstOrDefaultAsync(s =>
                            s.RefType == "leave" &&
                            s.RefRequestId == leaveRequest.LeaveRequestId);

                    if (approvalStatus != null)
                    {
                        approvalStatus.Status = ApproveStatus.New.ToString();
                        approvalStatus.UpdateDate = DateTime.UtcNow;
                        approvalStatus.UpdateBy = currentUser;
                    }
                }
                // ================= CREATE =================
                else
                {
                    // ❗ ถ้าเป็นไปได้ แนะนำใช้ Identity / Sequence
                    var newId = (await _context.LeaveRequests
                        .MaxAsync(r => (int?)r.LeaveRequestId) ?? 0) + 1;

                    leaveRequest = new LeaveRequest
                    {
                        LeaveRequestId = newId,
                        EmployeeId = dto.EmployeeId,
                        LeaveTypeId = dto.LeaveTypeId,
                        StartDate = dto.StartDate,
                        EndDate = dto.EndDate,
                        TotalDays = dto.TotalDays,
                        Reason = dto.Reason,
                        DayType = dto.DayType,
                        RefId = refId,
                        Status = ApproveStatus.New.ToString(),
                        CurrentApprovalLevel = 1,
                        RequestDate = DateTime.UtcNow,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = currentUser
                    };

                    await _context.LeaveRequests.AddAsync(leaveRequest);

                    var ruleId = await _context.ApprovalSteps
                        .Where(s => s.RefId == refId && s.StepOrder == 1)
                        .Select(s => s.RuleId)
                        .FirstOrDefaultAsync();

                    _context.ApprovalStatuses.Add(new ApprovalStatus
                    {
                        RefType = "leave",
                        RefId = refId,
                        RefRequestId = newId,
                        Status = ApproveStatus.New.ToString(),
                        RequestedBy = (int)dto.EmployeeId,
                        RequestedAt = DateTime.UtcNow,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = currentUser,
                        CurrentStepOrder = 1,
                        RuleId = ruleId
                    });
                }

                await _context.SaveChangesAsync();
                return leaveRequest;
            }
            catch (Exception ex)
            {
                _loggingService.LogError(
                    ex.Message,
                    ex.StackTrace,
                    "save-or-update-leave-request",
                    currentUser);

                throw;
            }
        }

        public async Task<List<LeaveResponseDto>> GetLeaveRequestsAsync()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var currentYear = DateTime.Now.Year;
            return await (from lr in _context.LeaveRequests.AsNoTracking()
                          join emp in _context.Employees on lr.EmployeeId equals emp.Id into employeeJoin
                          from emp in employeeJoin.DefaultIfEmpty() 
                          join lt in _context.LeaveTypes on lr.LeaveTypeId equals lt.LeaveTypeId into leaveTypeJoin
                          from lt in leaveTypeJoin.DefaultIfEmpty()
                          join appr in _context.Employees on lr.ApproverId equals appr.Id into approverJoin
                          from appr in approverJoin.DefaultIfEmpty() 
                          where lr.StartDate.Year >= currentYear - 1 && lr.StartDate.Year <= currentYear + 1
                          // 🔥 เรียง status ก่อน
                          orderby
                          lr.ApproverId == null ? 0 : 1,
                              lr.Status == "New" ? 1 :
                              lr.Status == "Approved" ? 2 :
                              lr.Status == "Declined" ? 3 :
                              lr.Status == "Cancelled" ? 4 : 5,

                              lr.StartDate descending
                          select new LeaveResponseDto
                          {
                              LeaveRequestId = lr.LeaveRequestId,
                              EmployeeId = lr.EmployeeId,
                              EmployeeName = emp != null ? emp.FirstNameEn + " " + emp.LastNameEn : null,
                              LeaveTypeId = lr.LeaveTypeId,
                              LeaveTypeName = lt != null ? lt.LeaveTypeNameEn : null,
                              StartDate = lr.StartDate,
                              EndDate = lr.EndDate,
                              TotalDays = lr.TotalDays,
                              Reason = lr.Reason,
                              Comments = lr.Comments,
                              ApprovedDate = lr.ApprovedDate,
                              ApproverName = appr.FirstNameEn + " " + appr.LastNameEn,
                              ApprovalId = lr.ApproverId,
                              RequestDate = lr.RequestDate,
                              Status = lr.Status,
                              DayType = lr.DayType,
                              ImgPath = emp != null && !string.IsNullOrEmpty(emp.ImgPath)
                                  ? emp.ImgPath
                                  : null
                          }).ToListAsync();
        }
        public async Task<List<LeaveResponseDto>> GetLeaveRequestsByYearAsync(decimal employeeId , int year)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var currentYear = DateTime.Now.Year;

            var leaveRequests = await (from lr in _context.LeaveRequests.AsNoTracking()
                                       join emp in _context.Employees on lr.EmployeeId equals emp.Id into empJoin
                                       from emp in empJoin.DefaultIfEmpty() 
                                       join lt in _context.LeaveTypes on lr.LeaveTypeId equals lt.LeaveTypeId into ltJoin
                                       from lt in ltJoin.DefaultIfEmpty() 
                                       join approver in _context.Employees on lr.ApproverId equals approver.Id into approverJoin
                                       from approver in approverJoin.DefaultIfEmpty()
                                       select new LeaveResponseDto
                                       {
                                           LeaveRequestId = lr.LeaveRequestId,
                                           EmployeeId = lr.EmployeeId,
                                           EmployeeName = emp != null
                                               ? emp.FirstNameEn + " " + emp.LastNameEn
                                               : "Unknown", 
                                           LeaveTypeId = lr.LeaveTypeId,
                                           LeaveTypeName = lt != null
                                               ? lt.LeaveTypeNameEn
                                               : "N/A", 
                                           StartDate = lr.StartDate,
                                           EndDate = lr.EndDate,
                                           TotalDays = lr.TotalDays,
                                           Reason = lr.Reason,
                                           Comments = lr.Comments,
                                           ApprovedDate = lr.ApprovedDate,
                                           ApprovalId = approver.Id,
                                           ApproverName = approver.FirstNameEn + " " + approver.LastNameEn,
                                           RequestDate = lr.RequestDate ?? DateTime.MinValue,
                                           Status = lr.Status,
                                           DayType = lr.DayType,
                                           ImgPath = emp != null && !string.IsNullOrEmpty(emp.ImgPath)
                                               ? emp.ImgPath
                                               : null, 
                                         ApproverImgPath = approver != null && !string.IsNullOrEmpty(approver.ImgPath)
                                               ? approver.ImgPath
                                               : null,
                                       }).ToListAsync();

            return leaveRequests;
        }

        public async Task<List<LeaveRequestResponseDto>> GetLeaveRequestsByEmployeeIdAsync(decimal employeeId)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var currentYear = DateTime.Now.Year;

            var leaveRequests = await (from lr in _context.LeaveRequests.AsNoTracking()
                                       join emp in _context.Employees on lr.EmployeeId equals emp.Id into empJoin
                                       from emp in empJoin.DefaultIfEmpty() 
                                       join lt in _context.LeaveTypes on lr.LeaveTypeId equals lt.LeaveTypeId into ltJoin
                                       from lt in ltJoin.DefaultIfEmpty() 
                                       join approver in _context.Employees on lr.ApproverId equals approver.Id into approverJoin
                                       from approver in approverJoin.DefaultIfEmpty()
                                       where lr.EmployeeId == employeeId &&
                                             lr.StartDate.Year >= currentYear - 1 &&
                                             lr.StartDate.Year <= currentYear + 1
                                       orderby
                                           lr.Status == "New" ? 1 :
                                           lr.Status == "Approved" ? 2 :
                                           lr.Status == "Declined" ? 3 :
                                           lr.Status == "Cancelled" ? 4 : 5,
                                           lr.StartDate descending
                                       select new LeaveRequestResponseDto
                                       {
                                           LeaveRequestId = lr.LeaveRequestId,
                                           EmployeeId = lr.EmployeeId,
                                           EmployeeName = emp != null
                                               ? emp.FirstNameEn + " " + emp.LastNameEn
                                               : "Unknown", 
                                           LeaveTypeId = lr.LeaveTypeId,
                                           LeaveTypeName = lt != null
                                               ? lt.LeaveTypeNameEn
                                               : "N/A", 
                                           StartDate = lr.StartDate,
                                           EndDate = lr.EndDate,
                                           TotalDays = lr.TotalDays,
                                           Reason = lr.Reason,
                                           RequestDate = lr.RequestDate ?? DateTime.MinValue,
                                           Status = lr.Status,
                                           ApproverId = lr.ApproverId,
                                           ApproverName = approver != null
                                               ? approver.FirstNameEn + " " + approver.LastNameEn
                                               : "N/A", 
                                           ApproverImgPath = approver != null && !string.IsNullOrEmpty(approver.ImgPath)
                                               ? approver.ImgPath
                                               : null, 
                                           DayType = lr.DayType,
                                           ApprovedDate = lr.ApprovedDate,
                                           Comments = lr.Comments
                                       }).ToListAsync();

            return leaveRequests;
        }
        public async Task<List<LeaveAvailableResponseDto>> GetAvailableLeaveQuotaAsync(decimal employeeId, int year, string lang)
        {

            var allLeaveTypes = await _context.LeaveTypes.ToListAsync();

            var leaveQuotas = await _context.LeaveQuotas
                                 .Where(lq => lq.EmployeeId == employeeId && lq.Year == year)
                                 .Include(lq => lq.LeaveType) 
                                 .ToListAsync();

            var usedLeaves = await _context.LeaveRequests
                                .Where(lr => lr.EmployeeId == employeeId && lr.Status == ApproveStatus.Approved.ToString() && lr.StartDate.Year == year)
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
                    EmployeeId = employeeId,
                    LeaveTypeId = leaveType.LeaveTypeId,
                    TotalQuota = (quota?.Quota ?? 0m) + (quota?.ExtraDay ?? 0m),
                    UsedLeaveDays = usedDays,
                    AvailableQuota = ((quota?.Quota ??0) + (quota?.ExtraDay ?? 0)) - usedDays,
                    LeaveTypeName = lang == "th" ? leaveType.LeaveTypeNameTh : leaveType.LeaveTypeNameEn
                });
            }

            return response;
        }
        public async Task<LeaveRequest> UpdateLeaveRequestStatusAsync(
            int leaveRequestId,
            ApproveStatus status,
            decimal approverId,
            string? currentUser,
            string? comments)
        {
            try
            {
                var now = DateTime.UtcNow;
                var statusStr = status.ToString();

                // 1️⃣ Load leave request
                var leaveRequest = await _context.LeaveRequests
                    .FirstOrDefaultAsync(x => x.LeaveRequestId == leaveRequestId);

                if (leaveRequest == null)
                    throw new Exception("Leave request not found.");

                // 2️⃣ Update leave request status
                leaveRequest.Status = statusStr;
                leaveRequest.UpdateDate = now;
                leaveRequest.UpdateBy = currentUser;
                leaveRequest.Comments = comments;
                leaveRequest.ApproverId = approverId;
                leaveRequest.ApprovedDate = now;

                // 3️⃣ Update approval status (batch with above)
                var approval = await _context.ApprovalStatuses
                    .FirstOrDefaultAsync(x =>
                        x.RefType == "leave" &&
                        x.RefRequestId == leaveRequestId);

                if (approval != null)
                {
                    approval.Status = statusStr;
                    approval.UpdateDate = now;
                    approval.UpdateBy = currentUser;
                }

                // 4️⃣ If Approved → recalculate CarryForward
                if (status == ApproveStatus.Approved)
                {
                    var year = leaveRequest.StartDate.Year;

                    var leaveQuota = await _context.LeaveQuotas
                        .FirstOrDefaultAsync(x =>
                            x.EmployeeId == leaveRequest.EmployeeId &&
                            x.LeaveTypeId == leaveRequest.LeaveTypeId &&
                            x.Year == year);

                    if (leaveQuota != null)
                    {
                        var totalUsed = await _context.LeaveRequests
                            .Where(x =>
                                x.EmployeeId == leaveRequest.EmployeeId &&
                                x.LeaveTypeId == leaveRequest.LeaveTypeId &&
                                x.Status == ApproveStatus.Approved.ToString() &&
                                x.StartDate.Year == year)
                            .SumAsync(x => (decimal?)x.TotalDays) ?? 0m;

                        var quotaDays = leaveQuota.Quota;
                        var extraDays = leaveQuota.ExtraDay ?? 0m;
                        leaveQuota.CarryForward = Math.Max(0, (quotaDays + extraDays) - totalUsed);
                        leaveQuota.UpdateDate = now;
                        leaveQuota.UpdateBy = currentUser;
                    }
                }

                // 5️⃣ Single SaveChangesAsync — all changes batched in one DB round-trip
                await _context.SaveChangesAsync();

                // 6️⃣ Email (outside save, non-blocking)
                try
                {
                    var emp = await _context.Employees
                        .AsNoTracking()
                        .FirstOrDefaultAsync(e => e.Id == leaveRequest.EmployeeId);

                    if (emp != null)
                    {
                        var values = new Dictionary<string, string>
                        {
                            { "EmployeeName", emp.FirstNameEn + " " + emp.LastNameEn },
                            { "LeaveDate", leaveRequest.StartDate.ToShortDateString() },
                            { "LeaveDays", leaveRequest.TotalDays.ToString() }
                        };

                        await _emailService.GetTemplateWithContentAsync("LEAVE_APPROVED", values, "en");
                        // send email here if needed
                    }
                }
                catch { /* email failure should not roll back approval */ }

                return leaveRequest;
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "update-leave-request-status", currentUser);
                throw;
            }
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
        public class LeaveSummaryItemDto
        {
            public string Name { get; set; }
            public int Count { get; set; }
        }

        public class LeaveSummaryDto
        {
            public List<LeaveSummaryItemDto> SummaryItems { get; set; }
        }


        public async Task<LeaveSummaryDto> GetLeaveSummaryAsync(string lang = "en")
        {
            var today = DateTime.Today;

            var todayPresentsCount = await _context.LeaveRequests
                .CountAsync(lr => !(lr.StartDate <= today && today <= lr.EndDate));

            var plannedLeavesCount = await _context.LeaveRequests
                .CountAsync(lr => lr.Status == "Approved" && lr.StartDate >= today);

            var unplannedLeavesCount = await _context.LeaveRequests
                .CountAsync(lr => lr.Status == "Approved" && lr.StartDate <= today && today <= lr.EndDate);

            var pendingRequestsCount = await _context.LeaveRequests
                .CountAsync(lr => lr.Status == "New");

            // ใช้ Dictionary หรือ switch-case สำหรับข้อความหลายภาษา
            var nameMap = new Dictionary<string, (string En, string Th)>
            {
                ["TodayPresents"] = ("Today Presents", "มาทำงานวันนี้"),
                ["PlannedLeaves"] = ("Planned Leaves", "ลางานล่วงหน้า"),
                ["UnplannedLeaves"] = ("Unplanned Leaves", "ลางานกะทันหัน"),
                ["PendingRequests"] = ("Pending Requests", "คำขอลางานที่รอดำเนินการ")
            };

            string GetText(string key) =>
                lang == "th" ? nameMap[key].Th : nameMap[key].En;

            var summary = new LeaveSummaryDto
            {
                SummaryItems = new List<LeaveSummaryItemDto>
        {
            new LeaveSummaryItemDto { Name = GetText("TodayPresents"), Count = todayPresentsCount },
            new LeaveSummaryItemDto { Name = GetText("PlannedLeaves"), Count = plannedLeavesCount },
            new LeaveSummaryItemDto { Name = GetText("UnplannedLeaves"), Count = unplannedLeavesCount },
            new LeaveSummaryItemDto { Name = GetText("PendingRequests"), Count = pendingRequestsCount }
        }
            };

            return summary;
        }


    }
}

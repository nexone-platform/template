
using AutoMapper;
using Kros.Extensions;
using MailKit.Search;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using System.Data;
using System.Linq;
using System.Security.Claims;
using static Middlewares.Constant.StatusConstant;

namespace solutionAPI.Services
{
    public class ApprovalService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        public ApprovalService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
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

        //public async Task<ApiResponse<ApprovalItemDto>> GetPendingApprovalsAsync(int approverId)
        //{
        //    var data = await (from status in _context.ApprovalStatuses
        //                        join rule in _context.ApprovalRules on status.RuleId equals rule.RuleId
        //                        join step in _context.ApprovalSteps on status.RuleId equals step.RuleId
        //                          join emp in _context.Employees on step.ApproverId equals emp.Id into employeeJoin
        //                          from emp in employeeJoin.DefaultIfEmpty() // Left join with Employee
        //                          join reference in _context.ApprovalReferences
        //                                on new { status.RefId, status.RefType }
        //                                equals new { RefId = reference.RefId, RefType = reference.RefType } into referenceJoin
        //                                from reference in referenceJoin.DefaultIfEmpty()
        //                          where step.ApproverId == approverId
        //                                && status.Status == "PENDING"
        //                        orderby step.StepOrder
        //                        select new ApprovalItemDto
        //                        {
        //                            InstanceId = status.InstanceId,
        //                            RefType = status.RefType,
        //                            RefId = status.RefId,
        //                            Status = status.Status,
        //                            RuleName = rule.RuleName,
        //                            StepOrder = step.StepOrder,
        //                            Position = step.Position,
        //                            ApproverId = step.ApproverId,
        //                            RequestedAt = status.RequestedAt,
        //                            ApproverName = emp.FirstNameEn + " " + emp.LastNameEn ?? " ",
        //                            RefDescription = reference != null ? reference.Description : null,
        //                            ImgPath = BuildImageUrl(emp.ImgPath),
        //                        }).ToListAsync();

        //    return new ApiResponse<ApprovalItemDto>
        //    {
        //        Data = data,
        //        TotalData = data.Count
        //    };
        //}

        private string? BuildImageUrl(string? imgPath)
        {
            if (string.IsNullOrEmpty(imgPath))
                return null;

            var request = _httpContextAccessor.HttpContext?.Request;
            if (request == null)
                return imgPath; // fallback: return relative path

            return $"{request.Scheme}://{request.Host}/{imgPath}";
        }
        //public async Task<string> TakeActionAsync(ApprovalActionRequest request)
        //{
        //    var status = await _context.ApprovalStatuses
        //                    .FirstOrDefaultAsync(x => x.InstanceId == request.InstanceId);

        //    if (status == null)
        //        throw new Exception("Approval instance not found");

        //    // Insert log
        //    var log = new ApprovalLog
        //    {
        //        InstanceId = request.InstanceId,
        //        StepId = request.StepId,
        //        ApproverId = request.ApproverId,
        //        Action = request.Action,
        //        ActionDate = DateTime.UtcNow,
        //        ReasonId = request.ReasonId,
        //        Comment = request.Comment,
        //        CreateDate = DateTime.UtcNow,
        //        CreateBy = request.ApproverId.ToString()
        //    };
        //    _context.ApprovalLogs.Add(log);

        //    // Update status
        //    status.Status = request.Action == "APPROVE" ? "APPROVED" : "REJECTED";
        //    status.UpdateDate = DateTime.UtcNow;
        //    status.UpdateBy = request.ApproverId.ToString();

        //    await _context.SaveChangesAsync();

        //    return status.Status;
        //}
        public async Task<string> TakeActionAsync(ApprovalActionRequest request)
        {

            try
            {
                // 1. ดึง status ของ instance
                var status = await _context.ApprovalStatuses
                    .FirstOrDefaultAsync(x => x.InstanceId == request.InstanceId);

                if (status == null)
                    throw new Exception("Approval instance not found");

                // 2. ถ้า Declined หรือ Return ต้องมีเหตุผล
                if (request.Action == ApproveStatus.Declined || request.Action == ApproveStatus.Return)
                {
                    // ใช้ string.IsNullOrWhiteSpace ตรวจสอบ comment ว่าง, null หรือ space
                    if (string.IsNullOrWhiteSpace(request.Comment))
                    {
                        if (request.ReasonId == null)
                            throw new Exception("ReasonId is required when comment is empty for Declined/Return");

                        var reason = await _context.ApprovalCancelReasons
                            .FirstOrDefaultAsync(r => r.ReasonId == request.ReasonId && r.IsActive);

                        if (reason == null)
                            throw new Exception("Invalid reason");
                    }
                    // ถ้า comment มีค่า → ไม่ต้องตรวจ ReasonId
                }

                // 3. Insert log
                var log = new ApprovalLog
                {
                    InstanceId = status.InstanceId,
                    StepId = request.StepId,
                    ApproverId = request.ApproverId,
                    Action = request.Action.ToString(),
                    ActionDate = DateTime.UtcNow,
                    ReasonId = request.ReasonId,
                    Comment = request.Comment,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = request.ApproverId.ToString()
                };
                _context.ApprovalLogs.Add(log);

                // 4. Process action
                switch (request.Action)
                {
                    case ApproveStatus.Approved:
                        var currentStep = await _context.ApprovalSteps
                            .FirstOrDefaultAsync(s => s.StepId == request.StepId);

                        if (currentStep == null)
                            throw new Exception("Approval step not found");

                        var nextStep = await _context.ApprovalSteps
                            .Where(s => s.RuleId == currentStep.RuleId && s.StepOrder > currentStep.StepOrder)
                            .OrderBy(s => s.StepOrder)
                            .FirstOrDefaultAsync();

                        if (nextStep != null)
                        {
                            var next = currentStep.StepOrder + 1;
                            // ยังมี step ถัดไป → Pending
                            status.Status = ApproveStatus.WaitForApprove.ToString();
                            status.CurrentStepOrder = nextStep.StepOrder;
                            await UpdateSourceRequestStatusAsync(status.RefType, status.RefRequestId, status.Status, request, next);

                        }
                        else
                        {
                            // Step สุดท้าย → Approved สมบูรณ์
                            status.Status = ApproveStatus.Approved.ToString();
                            await UpdateSourceRequestStatusAsync(status.RefType, status.RefRequestId, status.Status, request, currentStep.StepOrder);
                        }
                        break;

                    case ApproveStatus.Declined:
                        var current = await _context.ApprovalSteps
                            .FirstOrDefaultAsync(s => s.StepId == request.StepId);
                        status.Status = ApproveStatus.Declined.ToString();
                        await UpdateSourceRequestStatusAsync(status.RefType, status.RefRequestId, status.Status, request, current.StepOrder);
                        break;

                    case ApproveStatus.Return:
                        var step = await _context.ApprovalSteps
                            .FirstOrDefaultAsync(s => s.StepId == request.StepId);

                        if (step == null)
                            throw new Exception("Approval step not found");

                        var prevStep = await _context.ApprovalSteps
                            .Where(s => s.RuleId == step.RuleId && s.StepOrder < step.StepOrder)
                            .OrderByDescending(s => s.StepOrder)
                            .FirstOrDefaultAsync();

                        if (prevStep != null)
                        {
                            var prev = step.StepOrder - 1;
                            // กลับไป step ก่อนหน้า
                            status.CurrentStepOrder = 0;
                            status.Status = ApproveStatus.Return.ToString();
                            status.CurrentStepOrder = prevStep.StepOrder;

                            await UpdateSourceRequestStatusAsync(status.RefType, status.RefRequestId, status.Status, request, prev);
                        }
                        else
                        {
                            // ถ้าไม่มี step ก่อนหน้า → Return to Owner
                            status.Status = ApproveStatus.Return.ToString();
                            await UpdateSourceRequestStatusAsync(status.RefType, status.RefRequestId, status.Status, request, step.StepOrder);
                        }
                        break;

                    default:
                        throw new Exception("Invalid action");
                }

                // 5. Update status metadata
                status.UpdateDate = DateTime.UtcNow;
                status.UpdateBy = request.ApproverId.ToString();

                await _context.SaveChangesAsync();

                return status.Status;
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "EmploymentService", "Username");
                throw;
            }
        }

        public async Task<List<(int InstanceId, string Status)>> TakeBulkActionAsync(List<ApprovalActionRequest> requests)
        {
            var results = new List<(int InstanceId, string Status)>();

            foreach (var req in requests)
            {
                var status = await TakeActionAsync(req); // reuse method เดิม
                results.Add((req.InstanceId, status.ToString()));
            }

            return results;
        }
        private async Task UpdateSourceRequestStatusAsync(string refType, int? refRequestId, string newStatus, ApprovalActionRequest? request, int? step=0)
        {
            var today = DateTime.Today;
            switch (refType.ToUpper())
            {
      
                case RefTypes.Leave:
                    var leave = await _context.LeaveRequests.FirstOrDefaultAsync(l => l.LeaveRequestId == refRequestId);
                    if (leave != null)
                    {
                        leave.Status = newStatus;
                        leave.ApproverId = request.ApproverId;
                        leave.ApprovedDate = today;
                        leave.Comments = request.Comment;
                        leave.UpdateDate = today;
                        leave.UpdateBy = request.Username;
                        leave.CurrentApprovalLevel = step;
                        _context.LeaveRequests.Update(leave);
                    }
                    break;

                case RefTypes.Resign:
                    var resign = await _context.Resignations.FirstOrDefaultAsync(r => r.ResignationId == refRequestId);
                    if (resign != null)
                    {
                        resign.Status = newStatus;
                        resign.ApprovedId = request.ApproverId;
                        resign.ApprovalDate = today;
                        resign.Comments = request.Comment;
                        resign.UpdateBy = request.Username;
                        resign.UpdateDate = today;
                        resign.CurrentApprovalLevel = step;
                        _context.Resignations.Update(resign);
                    }
                    break;

                case RefTypes.Promotion:
                    var promotion = await _context.Promotions.FirstOrDefaultAsync(p => p.PromotionId == refRequestId);
                    if (promotion != null)
                    {
                        promotion.Status = newStatus;
                        promotion.ApproverId = request.ApproverId;
                        promotion.ApprovalDate = today;
                        promotion.Comments = request.Comment;
                        promotion.UpdateDate = today;
                        promotion.UpdateBy = request.Username;
                        promotion.CurrentApprovalLevel = step;
                        _context.Promotions.Update(promotion);
                    }
                    break;

                case RefTypes.Overtime:
                    var overtime = await _context.OvertimeRequests.FirstOrDefaultAsync(o => o.OvertimeId == refRequestId);
                    if (overtime != null)
                    {
                        overtime.Status = newStatus;
                        overtime.ApprovedId = request.ApproverId;
                        overtime.ApprovalDate = today;
                        overtime.Comments = request.Comment;
                        overtime.UpdateBy = request.Username;
                        overtime.UpdateDate = today;
                        overtime.CurrentApprovalLevel = step;
                        _context.OvertimeRequests.Update(overtime);
                    }
                    break;

                default:
                    throw new Exception($"Unknown RefType: {refType}");
            }

            await _context.SaveChangesAsync();
        }

        public class ApprovalActionRequest
        {
            public int InstanceId { get; set; }
            public int StepId { get; set; }
            public int ApproverId { get; set; }
            public ApproveStatus Action { get; set; }
            public string Comment { get; set; }
            public int? ReasonId { get; set; }
            public string? Username { get; set; }
        }
        public class CreateApprovalRequest
        {
            public string RefType { get; set; }   // เช่น "LEAVE_REQUEST", "PURCHASE_ORDER"
            public int RefId { get; set; }        // ID ของเอกสาร
            public int RuleId { get; set; }       // ใช้ Rule ไหน
            public int RequestedBy { get; set; }  // ใครเป็นคนส่งคำขอ
        }

        //public async Task<long> CreateApprovalRequestAsync(CreateApprovalRequest request)
        //{
        //    // Insert Approval Status (Instance ใหม่)
        //    var status = new ApprovalStatus
        //    {
        //        RefType = request.RefType,
        //        RefId = request.RefId,
        //        RuleId = request.RuleId,
        //        Status = "PENDING",
        //        RequestedBy = request.RequestedBy,
        //        RequestedAt = DateTime.UtcNow,
        //        CreateDate = DateTime.UtcNow,
        //        CreateBy = request.RequestedBy.ToString()
        //    };

        //    _context.ApprovalStatuses.Add(status);
        //    await _context.SaveChangesAsync();

        //    // หา Step แรกของ Rule
        //    var firstStep = await _context.ApprovalSteps
        //        .Where(s => s.RuleId == request.RuleId)
        //        .OrderBy(s => s.StepOrder)
        //        .FirstOrDefaultAsync();

        //    if (firstStep != null)
        //    {
        //        // Insert Log เริ่มต้น
        //        var log = new ApprovalLog
        //        {
        //            InstanceId = status.InstanceId,
        //            StepId = firstStep.StepId,
        //            ApproverId = firstStep.ApproverId,
        //            Action = "REQUESTED",
        //            ActionDate = DateTime.UtcNow,
        //            Comment = "Request created",
        //            CreateDate = DateTime.UtcNow,
        //            CreateBy = request.RequestedBy.ToString()
        //        };
        //        _context.ApprovalLogs.Add(log);
        //        await _context.SaveChangesAsync();
        //    }

        //    return status.InstanceId;
        //}
        public async Task<long> CreateApprovalRequestAsync(CreateApprovalRequest request)
        {
            var reference = await _context.ApprovalReferences
                              .FirstOrDefaultAsync(r => r.RefType == request.RefType);

            if (reference == null)
                throw new Exception("Invalid ref_type");

            var status = new ApprovalStatus
            {
                RefType = reference.RefType, // อ้างอิงจากตาราง reference
                RefId = request.RefId,
                RuleId = request.RuleId,
                Status = "PENDING",
                RequestedBy = request.RequestedBy,
                RequestedAt = DateTime.UtcNow,
                CreateDate = DateTime.UtcNow,
                CreateBy = request.RequestedBy.ToString()
            };

            _context.ApprovalStatuses.Add(status);
            await _context.SaveChangesAsync();
            return status.InstanceId;
        }
        public class ApprovalItemDto
        {
            public long InstanceId { get; set; }
            public string RefType { get; set; }
            public int RefId { get; set; }
            public string Status { get; set; }
            public string RuleName { get; set; }
            public int StepOrder { get; set; }
            public string Position { get; set; }
            public decimal? ApproverId { get; set; }
            public DateTime? RequestedAt { get; set; }
            public string ApproverName { get; set; }
            public string? RefDescription { get; set; }
            public string? ImgPath { get; set; }
            public int? RefDocId { get; set; }
            public string RefLink { get; set; } = string.Empty;
        }

        public class PendingApprovalDto
        {
            public int InstanceId { get; set; }
            public string RefType { get; set; } = "";
            public int RefId { get; set; }
            public int RequestId { get; set; }
            public int EmployeeId { get; set; }
            public string? Description { get; set; }
            public DateTime? RequestDate { get; set; }
            public string Status { get; set; } = "";
            public int CurrentApprovalLevel { get; set; }
            public int? CurrentApproverId { get; set; }
            public string? CurrentApproverPosition { get; set; }
            public string? Comments { get; set; }
            public string ApproverName { get; set; }
            public string? RefDescription { get; set; }
            public string? ImgPath { get; set; }
            public string? EmployeeName { get; set; }
            public string? ApproverImgPath { get; set; }
            public int StepId { get; set; }
            public string? RuleName { get; set; }
            public string? Position { get; set; }
            public DateTime? CreatedDate { get; set; }
            public DateTime? UpdatedDate { get; set; }
            public decimal? RequestHour { get; set; }
            public bool IsEligibleForStep { get; set; }
        }
        public class PendingApprovalSearchDto
        {
            public int ApproverId { get; set; } // จำเป็น
            public string? RefType { get; set; } // Leave, Resign, Promotion, Overtime
            public string? Status { get; set; } = "Pending"; // ค่า default
            public DateTime? RequestDateFrom { get; set; }
            public DateTime? RequestDateTo { get; set; }
            public int? EmployeeId { get; set; }
            public string? Keyword { get; set; }
            public int? RefId { get; set; }

        }

        public async Task<List<PendingApprovalDto>> GetPendingApproveAsync(int approverId)
        {
            try
            {
                var leaveList = await GetLeavePending(approverId).ToListAsync();
                var resignList = await GetResignationPending(approverId).ToListAsync();
                var promotionList = await GetPromotionPending(approverId).ToListAsync();
                var overtimeList = await GetOvertimePending(approverId).ToListAsync();


                var allPendingList = 
                    leaveList
                    .Concat(resignList)
                    .Concat(promotionList)
                    .Concat(overtimeList)
                    .ToList();

                var employees = await _context.Employees.ToDictionaryAsync(e => e.Id);
                var steps = await _context.ApprovalSteps.ToDictionaryAsync(s => s.StepId);
                var approverRoleId = _context.Employees
                        .Where(e => e.Id == approverId)
                        .Select(e => e.RoleId)
                        .FirstOrDefault();
                var eligiblePending = allPendingList
                    .Where(x =>
                    {
                        if (!employees.TryGetValue(x.EmployeeId, out var emp)) return false;
                        if (!steps.TryGetValue(x.StepId, out var step)) return false;

                        return IsEligibleForStep(emp, step, approverId, approverRoleId, x.RequestHour);
                    })
                    .OrderBy(x => x.RefType)
                    .ThenByDescending(x => x.RequestDate)
                    .Select(MapPendingDto)
                    .ToList();

                return eligiblePending;
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "ApprovalService", "Username");
                throw;
            }
        }

        private IQueryable<PendingApprovalDto> GetLeavePending(int approverId)
        {
            var today = DateTime.Today;
            try {

                var approverRoleId = _context.Employees
                    .Where(e => e.Id == approverId)
                    .Select(e => e.RoleId)
                    .FirstOrDefault();
                return from lr in _context.LeaveRequests
                   join st in _context.ApprovalStatuses
                       on new { RefId = (int?)lr.RefId , RefRequestId = (int?)lr.LeaveRequestId, StepOrder = lr.CurrentApprovalLevel }
                       equals new { RefId = st.RefId, RefRequestId = st.RefRequestId, StepOrder = st.CurrentStepOrder }
                   join ar in _context.ApprovalReferences on lr.RefId equals ar.RefId into arJoin
                   from ar in arJoin.DefaultIfEmpty()
                   join aps in _context.ApprovalSteps
                   on new { RuleId = st.RuleId, StepOrder = st.CurrentStepOrder, RefId = lr.RefId }
                    equals new { RuleId = aps.RuleId, StepOrder = aps.StepOrder, RefId = aps.RefId }
                    into apsJoin
                    from aps in apsJoin.DefaultIfEmpty()
                       join emp in _context.Employees on lr.EmployeeId equals emp.Id into empJoin
                   from emp in empJoin.DefaultIfEmpty()
                   join appr in _context.Employees on lr.ApproverId equals appr.Id into apprJoin
                   from appr in apprJoin.DefaultIfEmpty()
                   join designEmp in _context.Designations on emp.DesignationId equals designEmp.DesignationId into designEmpJoin
                   from designEmp in designEmpJoin.DefaultIfEmpty()
                   join designApp in _context.Designations on appr.DesignationId equals designApp.DesignationId into designJoin
                   from designApp in designJoin.DefaultIfEmpty()
                   join rule in _context.ApprovalRules on st.RuleId equals rule.RuleId into ruleJoin
                   from rule in ruleJoin.DefaultIfEmpty()
                   where st.CurrentStepOrder == lr.CurrentApprovalLevel
                          && rule.IsActive
                          && (aps == null || (aps.StepOrder == st.CurrentStepOrder && aps.RefId == lr.RefId))
                         && (rule.StartDate == null || rule.StartDate <= DateTime.Today)
                         && (rule.EndDate == null || rule.EndDate >= DateTime.Today)
                   select new PendingApprovalDto
                   {
                       InstanceId = st.InstanceId,
                       RefType = ar.RefType,
                       RefId = ar.RefId,
                       RequestId = lr.LeaveRequestId,
                       StepId = aps.StepId,
                       RequestDate = lr.RequestDate,
                       Status = lr.Status ?? "",
                       CurrentApprovalLevel = lr.CurrentApprovalLevel??1,
                       CurrentApproverId = (int?)lr.ApproverId,
                       CurrentApproverPosition = !string.IsNullOrEmpty(designApp.DesignationNameEn)
                           ? designApp.DesignationNameTh : " ",
                       ApproverName = (appr.FirstNameEn + " " + appr.LastNameEn) ?? " ",
                       ApproverImgPath = appr.ImgPath,
                       RefDescription = lr.Reason != null ? lr.Reason : ar.Description,
                       ImgPath = emp.ImgPath,
                       Comments = lr.Comments,
                       EmployeeId = (int?)lr.EmployeeId ?? 0,
                       EmployeeName = (emp.FirstNameEn + " " + emp.LastNameEn) ?? " ",
                       RuleName = rule.RuleName,
                       Position = !string.IsNullOrEmpty(designEmp.DesignationNameEn)
                           ? designEmp.DesignationNameTh : " ",
                       UpdatedDate = st.UpdateDate,
                       RequestHour = lr.TotalDays,
                       IsEligibleForStep = IsEligibleForStep(emp, aps, approverId, approverRoleId, lr.TotalDays)
                   };
            } catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "GetLeavePending", "Username");
                throw;
            }
        }

        private IQueryable<PendingApprovalDto> GetResignationPending(int approverId)
        {
            var today = DateTime.Today;
            try
            {


                var approverRoleId = _context.Employees
                        .Where(e => e.Id == approverId)
                        .Select(e => e.RoleId)
                        .FirstOrDefault();

                var pendingResignations = from r in _context.Resignations
                                          join st in _context.ApprovalStatuses
                                              on new { RefId = (int?)r.RefId, RefRequestId = (int?)r.ResignationId, StepOrder = r.CurrentApprovalLevel }
                                              equals new { RefId = st.RefId, RefRequestId = st.RefRequestId, StepOrder = st.CurrentStepOrder }
                                          join ar in _context.ApprovalReferences on r.RefId equals ar.RefId into arJoin
                                          from ar in arJoin.DefaultIfEmpty()
                                              //join aps in _context.ApprovalSteps
                                              //       on st.RuleId equals aps.RuleId into apsJoin
                                              //from aps in apsJoin.DefaultIfEmpty()

                                        join aps in _context.ApprovalSteps
                                                on new { RuleId = st.RuleId,RefId = r.RefId }
                                                equals new { RuleId = aps.RuleId, RefId = aps.RefId} into apsJoin
                                        from aps in apsJoin.DefaultIfEmpty()
                                          join emp in _context.Employees on r.EmployeeId equals emp.Id into empJoin
                                          from emp in empJoin.DefaultIfEmpty()
                                          join appr in _context.Employees on r.ApprovedId equals appr.Id into apprJoin
                                          from appr in apprJoin.DefaultIfEmpty()
                                          join designEmp in _context.Designations on emp.DesignationId equals designEmp.DesignationId into designEmpJoin
                                          from designEmp in designEmpJoin.DefaultIfEmpty()
                                          join designApp in _context.Designations on appr.DesignationId equals designApp.DesignationId into designJoin
                                          from designApp in designJoin.DefaultIfEmpty()
                                          join rule in _context.ApprovalRules on st.RuleId equals rule.RuleId into ruleJoin
                                          from rule in ruleJoin.DefaultIfEmpty()
                                          where st.CurrentStepOrder == r.CurrentApprovalLevel
                                                && rule.IsActive 
                                                && (aps == null || (aps.StepOrder == st.CurrentStepOrder && aps.RefId == r.RefId))
                                                && (rule.StartDate == null || rule.StartDate <= DateTime.Today)
                                                && (rule.EndDate == null || rule.EndDate >= DateTime.Today)
                                          select new PendingApprovalDto
                                          {
                                              InstanceId = st.InstanceId,
                                              RefType = ar.RefType ?? "",
                                              RefId = ar.RefId ,
                                              RequestId = (int?)r.ResignationId ?? 0,
                                              StepId = aps.StepId,
                                              RequestDate = r.RequestDate,
                                              Status = r.Status ?? "",
                                              CurrentApprovalLevel = r.CurrentApprovalLevel ?? 1,
                                              CurrentApproverId = (int?)r.ApprovedId,
                                              CurrentApproverPosition = !string.IsNullOrEmpty(designApp.DesignationNameEn)
                                                  ? designApp.DesignationNameTh : " ",
                                              ApproverName = ((appr.FirstNameEn ?? "") + " " + (appr.LastNameEn ?? "")).Trim(),
                                              ApproverImgPath = appr.ImgPath,
                                              RefDescription = r.Reason ?? ar.Description,
                                              ImgPath = emp.ImgPath,
                                              Comments = r.Comments,
                                              EmployeeId = (int?)r.EmployeeId ?? 0,
                                              EmployeeName = ((emp.FirstNameEn ?? "") + " " + (emp.LastNameEn ?? "")).Trim(),
                                              RuleName = rule.RuleName,
                                              Position = !string.IsNullOrEmpty(designEmp.DesignationNameEn)
                                                  ? designEmp.DesignationNameTh : " ",
                                              CreatedDate = r.CreateDate,
                                              UpdatedDate = st.UpdateDate,
                                              RequestHour = null,
                                              IsEligibleForStep = IsEligibleForStep(emp, aps, approverId, approverRoleId, null)
                                          };

                return pendingResignations;
            } catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "GetResignationPending", "Username");
                throw;
            }
}

        private IQueryable<PendingApprovalDto> GetPromotionPending(int approverId)
        {
            var today = DateTime.Today;
            try
            {
                var approverRoleId = _context.Employees
                        .Where(e => e.Id == approverId)
                        .Select(e => e.RoleId)
                        .FirstOrDefault();
                return from p in _context.Promotions
                   join st in _context.ApprovalStatuses
                       on new { RefId = (int?)p.RefId , RefRequestId = (int?)p.PromotionId, StepOrder = p.CurrentApprovalLevel }
                       equals new { RefId = st.RefId, RefRequestId = st.RefRequestId, StepOrder = st.CurrentStepOrder }
                   join ar in _context.ApprovalReferences on p.RefId equals ar.RefId into arJoin
                   from ar in arJoin.DefaultIfEmpty()
                   join aps in _context.ApprovalSteps
                        on new { RuleId = st.RuleId, StepOrder = st.CurrentStepOrder, RefId = p.RefId }
                        equals new { RuleId = aps.RuleId, StepOrder = aps.StepOrder, RefId = aps.RefId }
                        into apsJoin
                   from aps in apsJoin.DefaultIfEmpty()
                   join emp in _context.Employees on p.EmployeeId equals emp.Id into empJoin
                   from emp in empJoin.DefaultIfEmpty()
                   join appr in _context.Employees on p.ApproverId equals appr.Id into apprJoin
                   from appr in apprJoin.DefaultIfEmpty()
                   join designEmp in _context.Designations on emp.DesignationId equals designEmp.DesignationId into designEmpJoin
                   from designEmp in designEmpJoin.DefaultIfEmpty()
                   join designApp in _context.Designations on appr.DesignationId equals designApp.DesignationId into designJoin
                   from designApp in designJoin.DefaultIfEmpty()
                   join rule in _context.ApprovalRules on st.RuleId equals rule.RuleId into ruleJoin
                   from rule in ruleJoin.DefaultIfEmpty()
                       where st.CurrentStepOrder == p.CurrentApprovalLevel
                         && rule.IsActive
                         && (aps == null || (aps.StepOrder == st.CurrentStepOrder && aps.RefId == p.RefId))
                         && (rule.StartDate == null || rule.StartDate <= DateTime.Today)
                         && (rule.EndDate == null || rule.EndDate >= DateTime.Today)
                   select new PendingApprovalDto
                   {
                       InstanceId = st.InstanceId,
                       RefType = ar.RefType,
                       RefId = ar.RefId,
                       RequestId = p.PromotionId,
                       StepId = aps.StepId,
                       RequestDate = p.PromotionDate,
                       Status = p.Status ?? "",
                       CurrentApprovalLevel = p.CurrentApprovalLevel ?? 1,
                       CurrentApproverId = (int?)p.ApproverId,
                       CurrentApproverPosition = !string.IsNullOrEmpty(designApp.DesignationNameEn)
                           ? designApp.DesignationNameTh : " ",
                       ApproverName = (appr.FirstNameEn + " " + appr.LastNameEn) ?? " ",
                       ApproverImgPath = appr.ImgPath,
                       RefDescription = ar.Description, // เดี๋ยวเพิ่ม reason ที่ promotion
                       ImgPath = emp.ImgPath,
                       Comments = p.Comments,
                       EmployeeId = (int?)p.EmployeeId ?? 0,
                       EmployeeName = (emp.FirstNameEn + " " + emp.LastNameEn) ?? " ",
                       RuleName = rule.RuleName,
                       Position = !string.IsNullOrEmpty(designEmp.DesignationNameEn)
                           ? designEmp.DesignationNameTh : " ",
                       UpdatedDate = st.UpdateDate,
                       RequestHour = null,
                       IsEligibleForStep = IsEligibleForStep(emp, aps, approverId, approverRoleId,  null)
                   };
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "GetPromotionPending", "Username");
                throw;
            }
        }

        private IQueryable<PendingApprovalDto> GetOvertimePending(int approverId)
        {
            var today = DateTime.Today;
            try
            {
                var approverRoleId = _context.Employees
                 .Where(e => e.Id == approverId)
                 .Select(e => e.RoleId)
                 .FirstOrDefault();

                var pendingOvertimes = from o in _context.OvertimeRequests
                                       join st in _context.ApprovalStatuses
                                               on new { RefId = o.RefId, RefRequestId = o.OvertimeId, StepOrder = o.CurrentApprovalLevel }
                                               equals new { RefId = (int?)st.RefId, RefRequestId = (int)st.RefRequestId, StepOrder = st.CurrentStepOrder }
                                       join ar in _context.ApprovalReferences on o.RefId equals ar.RefId into arJoin
                                       from ar in arJoin.DefaultIfEmpty()
                                       join aps in _context.ApprovalSteps
                                            on new { RuleId = st.RuleId, StepOrder = st.CurrentStepOrder, RefId = o.RefId }
                                            equals new { RuleId = aps.RuleId, StepOrder = aps.StepOrder, RefId = aps.RefId }
                                            into apsJoin
                                       from aps in apsJoin.DefaultIfEmpty()
                                       join emp in _context.Employees on o.EmployeeId equals emp.Id into empJoin
                                       from emp in empJoin.DefaultIfEmpty()
                                       join appr in _context.Employees on o.ApprovedId equals (int?)appr.Id into apprJoin
                                       from appr in apprJoin.DefaultIfEmpty()
                                       join designEmp in _context.Designations on emp.DesignationId equals designEmp.DesignationId into designEmpJoin
                                       from designEmp in designEmpJoin.DefaultIfEmpty()
                                       join designApp in _context.Designations on appr.DesignationId equals designApp.DesignationId into designJoin
                                       from designApp in designJoin.DefaultIfEmpty()
                                       join rule in _context.ApprovalRules on st.RuleId equals rule.RuleId into ruleJoin
                                       from rule in ruleJoin.DefaultIfEmpty()
                                       join ruleType in _context.RuleTypes on rule.RuleTypeId equals ruleType.RuleTypeId into ruleTypeJoin
                                       from ruleType in ruleTypeJoin.DefaultIfEmpty()
                                       where st.CurrentStepOrder == o.CurrentApprovalLevel
                                             && rule.IsActive
                                             && (aps == null || (aps.StepOrder == st.CurrentStepOrder && aps.RefId == o.RefId))
                                             && (rule.StartDate == null || rule.StartDate <= today)
                                             && (rule.EndDate == null || rule.EndDate >= today)
                                       select new PendingApprovalDto
                                       {
                                           InstanceId = st.InstanceId,
                                           RefType = ar.RefType ,
                                           RefId = ar.RefId ,
                                           RequestId = o.OvertimeId,
                                           StepId = aps.StepId,
                                           RequestDate = o.CreateDate,
                                           Status = o.Status ?? "",
                                           CurrentApprovalLevel = o.CurrentApprovalLevel ?? 0,
                                           CurrentApproverId = (int?)o.ApprovedId,
                                           CurrentApproverPosition = !string.IsNullOrEmpty(designApp.DesignationNameEn)
                                               ? designApp.DesignationNameTh : " ",
                                           ApproverName = ((appr.FirstNameEn ?? "") + " " + (appr.LastNameEn ?? "")).Trim(),
                                           ApproverImgPath = appr.ImgPath,
                                           RefDescription = o.Description ?? ar.Description,
                                           ImgPath = emp.ImgPath,
                                           Comments = o.Comments,
                                           EmployeeId = (int?)o.EmployeeId ?? 0,
                                           EmployeeName = ((emp.FirstNameEn ?? "") + " " + (emp.LastNameEn ?? "")).Trim(),
                                           RuleName = rule.RuleName,
                                           Position = !string.IsNullOrEmpty(designEmp.DesignationNameEn)
                                               ? designEmp.DesignationNameTh : " ",
                                           UpdatedDate = st.UpdateDate,
                                           RequestHour = o.Hour,
                                           IsEligibleForStep = IsEligibleForStep(emp, aps, approverId, approverRoleId, o.Amount)
                                       };
                return pendingOvertimes;
            } catch (Exception ex)
                {
                    _loggingService.LogError(ex.Message, ex.Message, "GetOvertimePending", "Username");
                    throw;
                }
            }

        private PendingApprovalDto MapPendingDto(PendingApprovalDto x)
        {
            try
            {
                return new PendingApprovalDto
                {
                    InstanceId = x.InstanceId,
                    RefType = x.RefType,
                    RefId = x.RefId,
                    RequestId = x.RequestId,
                    EmployeeId = x.EmployeeId,
                    RequestDate = x.RequestDate,
                    Status = x.Status,
                    CurrentApprovalLevel = x.CurrentApprovalLevel,
                    CurrentApproverId = x.CurrentApproverId,
                    CurrentApproverPosition = x.CurrentApproverPosition,
                    ApproverName = x.ApproverName,
                    RefDescription = x.RefDescription,
                    ImgPath = BuildImageUrl(x.ImgPath),
                    Comments = x.Comments,
                    EmployeeName = x.EmployeeName,
                    RuleName = x.RuleName,
                    Position = x.Position,
                    ApproverImgPath = BuildImageUrl(x.ApproverImgPath),
                    UpdatedDate = x.UpdatedDate,
                    StepId = x.StepId,
                    RequestHour = x.RequestHour,
                    IsEligibleForStep = x.IsEligibleForStep
                };
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "MapPendingDto", "Username");
                throw;
            }
        }

        private static bool IsEligibleForStep(Employee emp, ApprovalStep step, int approverId, decimal? approverRoleId, decimal? requestAmount)
        {
            if (requestAmount.HasValue)
            {
                if (step.MinAmount.HasValue && requestAmount.Value < step.MinAmount.Value) return false;
                if (step.MaxAmount.HasValue && requestAmount.Value > step.MaxAmount.Value) return false;
            }

            if (!string.IsNullOrEmpty(step.Department))
            {
                // กรณี step.Department เก็บเป็น string → cast DepartmentId เป็น string
                if (emp.DepartmentId?.ToString() != step.Department) return false;
            }

            if (step.ApproverId.HasValue && step.ApproverId.Value == approverId)
                return true;

            if (step.RoleId.HasValue && approverRoleId.HasValue && step.RoleId.Value == approverRoleId.Value)
                return true;

            return false;
        }


        public class ApprovalStepDto
        {
            public int? step_id { get; set; }
            public int? rule_id { get; set; }
            public int? step_order { get; set; }
            public string? position { get; set; }
            public decimal? min_amount { get; set; }
            public decimal? max_amount { get; set; }
            public string? department { get; set; }
            public bool is_parallel { get; set; }
            public int? threshold_count { get; set; }
            public decimal? approver_id { get; set; }
            public int? ref_id { get; set; }
            public decimal? role_id { get; set; }
            public int? designation_id { get; set; }
            //public bool isActive { get; set; }
        }

        public class BulkUpsertRequest
        {
            public int ruleId { get; set; }
            public List<ApprovalStepDto> steps { get; set; } = new();
        }

        public async Task<List<ApprovalStep>> GetStepsByRuleAsync(int ruleId)
        {
            return await _context.ApprovalSteps
                .Where(x => x.RuleId == ruleId)
                .OrderBy(x => x.StepOrder)
                .ToListAsync();
        }

        public Task<List<ApprovalStep>> GetStepsAsync(int? ruleId)
        {
            return _context.ApprovalSteps
                .Where(x => !ruleId.HasValue || x.RuleId == ruleId.Value)
                .OrderBy(x => x.RuleId).ThenBy(x => x.StepOrder)
                .ToListAsync();
        }

        public async Task<int> BulkUpsertStepsAsync(int ruleId, IEnumerable<ApprovalStepDto> steps, string user)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            var existing = await _context.ApprovalSteps.Where(x => x.RuleId == ruleId).ToListAsync();
            _context.ApprovalSteps.RemoveRange(existing);

            var now = DateTime.UtcNow;
            var order = 1;

            foreach (var s in steps.OrderBy(x => x.step_order))
            {
                _context.ApprovalSteps.Add(new ApprovalStep
                {
                    RuleId = ruleId,
                    StepOrder = order++,
                    Position = s.position,
                    MinAmount = s.min_amount,
                    MaxAmount = s.max_amount,
                    Department = s.department,
                    IsParallel = s.is_parallel,
                    ApproverId = s.approver_id,
                    RefId = s.ref_id,
                    RoleId = s.role_id,
                    DesignationId = s.designation_id,
                    CreateDate = now,
                    CreateBy = user,
                    UpdateDate = now,
                    UpdateBy = user,
                    //IsActive = s.isActive
                });
            }

            var affected = await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return affected;
        }

        public async Task DeleteStepAsync(int stepId)
        {
            var e = await _context.ApprovalSteps.FindAsync(stepId);
            if (e == null) return;
            _context.ApprovalSteps.Remove(e);
            await _context.SaveChangesAsync();
        }

        public async Task<List<object>> GetDepartmentsAsync()
        {
            // ส่งของที่ FE ต้องใช้พอ: id, code, ชื่อภาษาไทย/อังกฤษ
            return await _context.Departments
                .Where(d => d.IsActive)
                .OrderBy(d => d.DepartmentNameTh ?? d.DepartmentNameEn ?? d.DepartmentCode)
                .Select(d => new {
                    departmentId = d.DepartmentId,
                    departmentCode = d.DepartmentCode,
                    nameTh = d.DepartmentNameTh,
                    nameEn = d.DepartmentNameEn
                })
                .ToListAsync<object>();
        }

        // ดึงรายการ Reference สำหรับ dropdown
        public async Task<List<object>> GetReferencesAsync()
        {
            return await _context.Set<ApprovalReference>() // entity map -> [Table("app-tb-ms-approval-reference")]
                .OrderBy(x => x.RefType)
                .Select(x => new {
                    ref_id = x.RefId,
                    ref_type = x.RefId,
                    description = x.Description
                })
                .ToListAsync<object>();
        }

        // ดึงรายการ Rule สำหรับ dropdown
        public async Task<List<object>> GetRulesAsync()
        {
            return await _context.Set<ApprovalRule>() // entity map -> [Table("app-tb-ms-approval-rule")]
                .Where(r => r.IsActive)
                .OrderBy(r => r.RuleName)
                .Select(r => new {
                    rule_id = r.RuleId,
                    rule_name = r.RuleName
                })
                .ToListAsync<object>();
        }
    }



}

using Middleware.Data;
using Middlewares;
using Microsoft.EntityFrameworkCore;
using static Middlewares.Constant.StatusConstant;

namespace solutionAPI.Services
{
    public class ApprovalHistoryService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        public ApprovalHistoryService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;
        }

        public class ApprovalHistoryDto
        {
            public int ActionId { get; set; }
            public int InstanceId { get; set; }
            public int? StepId { get; set; }
            public string? StepName { get; set; }

            public int? ApproverId { get; set; }
            public string? ApproverName { get; set; }
            public string? ApproverPosition { get; set; }
            public string? ApproverImgPath { get; set; }

            public string? Action { get; set; }
            public DateTime? ActionDate { get; set; }
            public string? Reason { get; set; }
            public string? Comment { get; set; }

            // 🔹 ข้อมูลจาก ApprovalStatus
            public string? RefType { get; set; }
            public int? RefId { get; set; }
            public int? RuleId { get; set; }
            public string? RuleName { get; set; }
            public int? RequestedBy { get; set; }
            public DateTime? RequestedAt { get; set; }

  
        }
        public async Task<List<ApprovalHistoryDto>> GetApprovalHistoryAsync(int instanceId, int approverId)
        {
            try
            {
                var currentStepOrder = await (
                                        from log in _context.ApprovalLogs
                                        join step in _context.ApprovalSteps on log.StepId equals step.StepId
                                        where log.InstanceId == instanceId && log.ApproverId == approverId
                                        select step.StepOrder
                                    ).FirstOrDefaultAsync();

                // see all
                if (currentStepOrder == 0)
                {
                    currentStepOrder = int.MaxValue; 
                }

                var query = from log in _context.ApprovalLogs

                            join status in _context.ApprovalStatuses
                                on log.InstanceId equals status.InstanceId into statusJoin
                            from status in statusJoin.DefaultIfEmpty()

                            join step in _context.ApprovalSteps
                                on log.StepId equals step.StepId into stepJoin
                            from step in stepJoin.DefaultIfEmpty()

                            join emp in _context.Employees
                                on log.ApproverId equals (int)emp.Id into empJoin
                            from emp in empJoin.DefaultIfEmpty()

                            join des in _context.Designations
                                on emp.DesignationId equals des.DesignationId into desJoin
                            from des in desJoin.DefaultIfEmpty()

                            join reason in _context.ApprovalCancelReasons
                                on log.ReasonId equals reason.ReasonId into reasonJoin
                            from reason in reasonJoin.DefaultIfEmpty()

                            join ar in _context.ApprovalReferences on status.RefId equals ar.RefId into arJoin
                            from ar in arJoin.DefaultIfEmpty()

                            join rule in _context.ApprovalRules on status.RuleId equals rule.RuleId into ruleJoin
                            from rule in ruleJoin.DefaultIfEmpty()
                            join ruleType in _context.RuleTypes on rule.RuleTypeId equals ruleType.RuleTypeId into ruleTypeJoin
                            from ruleType in ruleTypeJoin.DefaultIfEmpty()

                            where log.InstanceId == instanceId
                                     && (step.StepOrder <= currentStepOrder)
                            orderby log.ActionDate
                            select new ApprovalHistoryDto
                            {
                                ActionId = (int)log.ActionId,
                                InstanceId = (int)log.InstanceId,
                                StepId = log.StepId,
                                StepName = step.Position ?? ("Step " + step.StepOrder),
                                ApproverId = log.ApproverId,
                                ApproverName = ((emp.FirstNameEn ?? "") + " " + (emp.LastNameEn ?? "")).Trim(),
                                ApproverPosition = des.DesignationNameTh ?? des.DesignationNameEn,
                                Action = log.Action,
                                ActionDate = log.ActionDate,
                                Reason = reason.ReasonDetail,
                                Comment = log.Comment,
                                ApproverImgPath = emp.ImgPath,
                                RefType = ar.RefType,
                                RefId = status.RefId,
                                RuleId = status.RuleId,
                                RequestedAt = status.RequestedAt,
                                RequestedBy = status.RequestedBy
                            };

                var result = await query.ToListAsync();

                // แปลง path เป็น URL (ถ้าคุณมีฟังก์ชัน BuildImageUrl อยู่แล้ว)
                foreach (var h in result)
                {
                    h.ApproverImgPath = h.ApproverImgPath;
                }

                return result;
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "GetApprovalHistoryAsync", "Username");
                throw;
            }
        }


        private string? BuildImageUrl(string? imgPath)
        {
            if (string.IsNullOrEmpty(imgPath))
                return null;

            var request = _httpContextAccessor.HttpContext?.Request;
            if (request == null)
                return imgPath; // fallback: return relative path

            return $"{request.Scheme}://{request.Host}/{imgPath}";
        }

    }
}

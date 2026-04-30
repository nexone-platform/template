using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;
using solutionAPI.Services;
using static solutionAPI.Services.ApprovalHistoryService;
using static solutionAPI.Services.ApprovalService;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace solutionAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ApprovalController : ControllerBase
    {
        private readonly ApprovalService _approvalService;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILoggingService _loggingService;
        private readonly ApprovalHistoryService _approvalHistoryService;
        public ApprovalController(ApplicationDbContext context, IMapper mapper, ApprovalService approvalService, ILoggingService loggingService, ApprovalHistoryService approvalHistoryService)
        {
            _mapper = mapper;
            _context = context;
            _approvalService = approvalService;
            _loggingService = loggingService;
            _approvalHistoryService = approvalHistoryService;
        }
        //[HttpGet("pending/{approverId}")]
        //public async Task<IActionResult> GetPending(int approverId)
        //{
        //    var result = await _approvalService.GetPendingAsync(approverId);
        //    return Ok(new ApiResponse<PendingApprovalDto>
        //    {
        //        Data = result,
        //        TotalData = result.Count
        //    });
        //}

        //[HttpGet("pendingData/{approverId}")]
        //public async Task<IActionResult> GetPendingdata(int approverId)
        //{
        //    var result = await _approvalService.GetPendingApprovalsAsync(approverId);
        //    return Ok(result);
        //}

        [HttpPost("action")]
        public async Task<IActionResult> TakeAction([FromBody] ApprovalActionRequest request)
        {
            var status = await _approvalService.TakeActionAsync(request);
            return Ok(new { message = "Action completed", status });
        }

        [HttpPost("bulk-action")]
        public async Task<IActionResult> TakeBulkAction([FromBody] List<ApprovalActionRequest> requests)
        {
            var results = await _approvalService.TakeBulkActionAsync(requests);
            return Ok(new { message = "Bulk action completed", results });
        }


        [HttpPost("request")]
        public async Task<IActionResult> CreateRequest([FromBody] CreateApprovalRequest request)
        {
            var instanceId = await _approvalService.CreateApprovalRequestAsync(request);
            return Ok(new { message = "Approval request created", instanceId });
        }

        [HttpGet("cancel-reasons")]
        public async Task<IActionResult> GetCancelReasons()
        {
            try
            {
                var reasons = await _context.ApprovalCancelReasons
              .Where(r => r.IsActive)
              .OrderBy(r => r.CreatedAt)
              .ToListAsync();


                var response = new ApiResponse<ApprovalCancelReason>
                {
                    Data = reasons,
                    TotalData = reasons.Count
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "EmploymentService", "Username");
                throw;
            }

        }

        [HttpPost("pending")]
        public async Task<IActionResult> GetPendingApprovals([FromBody] PendingApprovalSearchDto search)
        {
            if (search.ApproverId <= 0)
                return BadRequest(new { message = "ApproverId is required" });

            // ดึงข้อมูลทั้งหมดก่อน (filter หลักคือ ApproverId)
            var result = await _approvalService.GetPendingApproveAsync(search.ApproverId);

            // Filter เพิ่มเติมในฝั่ง Controller
            if (search.RefId.HasValue)
                result = result.Where(x => x.RefId == search.RefId.Value).ToList();

            if (!string.IsNullOrEmpty(search.Status))
                result = result.Where(x => x.Status == search.Status).ToList();

            if (search.RequestDateFrom.HasValue)
                result = result.Where(x => x.RequestDate >= search.RequestDateFrom.Value).ToList();

            if (search.RequestDateTo.HasValue)
                result = result.Where(x => x.RequestDate <= search.RequestDateTo.Value).ToList();

            if (search.EmployeeId.HasValue)
                result = result.Where(x => x.EmployeeId == search.EmployeeId.Value).ToList();

            if (!string.IsNullOrEmpty(search.Keyword))
                result = result.Where(x =>
                    (x.RefDescription != null && x.RefDescription.Contains(search.Keyword)) ||
                    (x.Comments != null && x.Comments.Contains(search.Keyword))
                ).ToList();


            return Ok(new ApiResponse<PendingApprovalDto>
            {
                Data = result,
                TotalData = result.Count
            });

        }

        [HttpGet("steps")]
        public async Task<IActionResult> GetSteps([FromQuery] int ruleId)
        {
            var rows = await _approvalService.GetStepsByRuleAsync(ruleId);

            var result = rows.Select(x => new ApprovalStepDto
            {
                step_id = x.StepId,
                rule_id = x.RuleId,
                step_order = x.StepOrder,
                position = x.Position,
                min_amount = x.MinAmount,
                max_amount = x.MaxAmount,
                department = x.Department,
                is_parallel = x.IsParallel,
                threshold_count = x.ThresholdCount,
                approver_id = x.ApproverId,
                ref_id = x.RefId,
                role_id = x.RoleId,
                designation_id = x.DesignationId
            });

            return Ok(result);
        }

        // GET /Approval/steps/all -> คืนทั้งหมด
        [HttpGet("steps/all")]
        public async Task<IActionResult> GetAllSteps()
        {
            var rows = await _approvalService.GetStepsAsync(null);
            var result = rows.Select(x => new ApprovalStepDto
            {
                step_id = x.StepId,
                rule_id = x.RuleId,
                step_order = x.StepOrder,
                position = x.Position,
                min_amount = x.MinAmount,
                max_amount = x.MaxAmount,
                department = x.Department,
                is_parallel = x.IsParallel,
                approver_id = x.ApproverId,
                ref_id = x.RefId,
                role_id = x.RoleId,
                designation_id = x.DesignationId
            });
            return Ok(result);
        }

        [HttpPost("steps/bulk")]
        public async Task<IActionResult> BulkUpsertSteps([FromBody] BulkUpsertRequest request)
        {
            if (request == null || request.ruleId <= 0)
                return BadRequest(new { message = "Invalid ruleId" });

            var user = User?.Identity?.Name ?? "system";
            var affected = await _approvalService.BulkUpsertStepsAsync(request.ruleId, request.steps, user);
            return Ok(new { affected });
        }

        // DELETE /Approval/steps/{id}
        [HttpDelete("steps/delete/{id:int}")]
        public async Task<IActionResult> DeleteStep(int id)
        {
            await _approvalService.DeleteStepAsync(id);
            return NoContent();
        }

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            var items = await _approvalService.GetDepartmentsAsync();
            return Ok(items);
        }

        [HttpGet("steps/references")]
        public async Task<IActionResult> GetReferences()
        {
            var items = await _approvalService.GetReferencesAsync();
            return Ok(items);
        }

        [HttpGet("steps/rules")]
        public async Task<IActionResult> GetRules()
        {
            var items = await _approvalService.GetRulesAsync();
            return Ok(items);
        }

        [HttpPost("history")]
        public async Task<IActionResult> GetApprovalHistory([FromBody] ApprovalHistoryRequest request)
        {
            var list = await _approvalHistoryService.GetApprovalHistoryAsync(request.InstanceId, request.ApproverId);

            if (list == null || !list.Any())
                return NotFound(new { message = "No approval history found." });

            var response = new ApiResponse<ApprovalHistoryDto>
            {
                Data = list,
                TotalData = list.Count
            };

            return Ok(response);
        }

        public class ApprovalHistoryRequest
        {
            public int InstanceId { get; set; }
            public int ApproverId { get; set; }
        }
    }
}

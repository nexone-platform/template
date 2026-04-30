using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using solutionAPI.Services;
using static Middlewares.Constant.StatusConstant;
using static solutionAPI.Controllers.AssetController;
using static solutionAPI.Services.LeaveRequestService;

namespace solutionAPI.Controllers
{

    [Route("[controller]")]
    [ApiController]
    public class LeaveRequestController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILoggingService _loggingService;
        private readonly LeaveRequestService _leaveRequestService;
        public LeaveRequestController(ApplicationDbContext context, IMapper mapper, ILoggingService loggingService, LeaveRequestService leaveRequestService)
        {
            _mapper = mapper;
            _loggingService = loggingService;
            _context = context;
            _leaveRequestService = leaveRequestService;
        }
        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<LeaveRequestResponseDto>>> GetLeaveRequestsByEmployeeId(int employeeId)
        {
            var leaveRequests = await _leaveRequestService.GetLeaveRequestsByEmployeeIdAsync(employeeId);

            var response = new ApiResponse<LeaveRequestResponseDto>
            {
                Data = leaveRequests,
                TotalData = leaveRequests.Count
            };

            return Ok(response);
        }

        [HttpGet("getAllRequest")]
        public async Task<ActionResult<IEnumerable<LeaveResponseDto>>> GetLeaveRequests()
        {
            var leaveRequests = await _leaveRequestService.GetLeaveRequestsAsync();

            var response = new ApiResponse<LeaveResponseDto>
            {
                Data = leaveRequests,
                TotalData = leaveRequests.Count
            };

            return Ok(response);
        }

        [HttpGet("available-quota")]
        public async Task<IActionResult> GetAvailableLeaveQuota(decimal employeeId, int year, string lang = "en")
        {
            var result = await _leaveRequestService.GetAvailableLeaveQuotaAsync(employeeId, year, lang);
            return Ok(result);
        }

        [HttpPost("update")]
        public async Task<IActionResult> SaveOrUpdateLeaveRequest([FromBody] LeaveRequestDto leaveRequestDto)
        {
            if (leaveRequestDto == null) return BadRequest(new { message = "Invalid request data." });

            try
            {
                var result = await _leaveRequestService.SaveOrUpdateLeaveRequestAsync(leaveRequestDto, leaveRequestDto.Username);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("requestStatus/{leaveRequestId}")]
        public async Task<IActionResult> UpdateLeaveRequestStatus(int leaveRequestId, [FromBody] LeaveRequestStatusRequest request)
        {
            var currentUser = User.Identity.Name; // Get the current user from the identity
            var approverId = request.ApproverId;

            try
            {
                var leaveRequest = await _leaveRequestService.UpdateLeaveRequestStatusAsync(leaveRequestId, request.Status, approverId, request.Username, request.Comments);
                return Ok(leaveRequest);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "update-leave-request-status", currentUser);
                return StatusCode(500, new { message = "An error occurred while updating the leave request status." });
            }
        }

        [HttpGet("leaveSummary")]
        public async Task<IActionResult> GetLeaveSummary([FromQuery] string lang = "en")
        {
            try
            {
                var summary = await _leaveRequestService.GetLeaveSummaryAsync(lang);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                var currentUser = User.Identity?.Name ?? "UnknownUser"; // Get the current user or set a default
                _loggingService.LogError(
                     ex.Message,
                    ex.StackTrace,
                   "GetLeaveSummary",
                    currentUser
                );
                return StatusCode(500, new { message = "An error occurred while retrieving the leave summary." });
            }
        }

        [HttpGet("search/{employeeId}")]
        public async Task<IActionResult> SearchLeaveRequestsByYear(int employeeId, [FromQuery] int year)
        {
            if (year <= 0)
            {
                return BadRequest(new { message = "Invalid year specified." });
            }

            var leaveRequests = await _leaveRequestService.GetLeaveRequestsByYearAsync(employeeId, year);

            if (leaveRequests == null || leaveRequests.Count == 0)
            {
                return NotFound(new { message = "No leave requests found for the specified year." });
            }

            return Ok(leaveRequests);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var leaveQuotas = await _context.LeaveRequests.FindAsync(id);
            if (leaveQuotas == null)
            {
                return NotFound(new { message = "Leave Requests not found" });
            }
            _context.LeaveRequests.Remove(leaveQuotas);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Leave Requests deleted successfully" });
        }

        [HttpGet("pendingApprovalCount")]
        public async Task<ActionResult<int>> GetPendingApprovalCountAsync()
        {
            try
            {
                // Count the number of pending requests
                var pendingCount = await _context.LeaveRequests
                    .CountAsync(o => o.Status == LeaveRequestStatus.New.ToString());

                // Return the count
                return Ok(pendingCount);
            }
            catch (Exception ex)
            {
                // Handle errors gracefully
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }
        public class LeaveRequestStatusRequest
        {
            public ApproveStatus Status { get; set; }
            public decimal ApproverId { get; set; } // Assuming ApproverId is of type decimal
            public string? Username { get; set; }
            public string? Comments { get; set; }
        }
    }
}

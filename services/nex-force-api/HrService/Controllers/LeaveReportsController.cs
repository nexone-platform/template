using HrService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static HrService.Services.LeaveReportsService;

namespace HrService.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class LeaveReportsController : ControllerBase
    {
        private readonly LeaveReportsService _leaveReportsService;
        public LeaveReportsController(LeaveReportsService leaveReportsService)
        {
            _leaveReportsService = leaveReportsService;
        }
        [HttpGet("available-quota")]
        public async Task<IActionResult> GetAvailableLeaveQuota( int year, string lang = "en")
        {
            var result = await _leaveReportsService.GetAvailableLeaveQuotaAsync( year, lang);
            return Ok(result);
        }
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableLeaveAsync(int year, string lang = "en")
        {
            try
            {
                var result = await _leaveReportsService.GetAvailableLeaveAsync(year, lang);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Log error ตามต้องการ
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("search-available")]
        public async Task<IActionResult> GetAvailableLeaveAsync([FromBody] LeaveSearchCriteriaDto criteria)
        {
            try
            {
                var result = await _leaveReportsService.GetSearchAvailableLeaveAsync(criteria);

                var response = new ApiResponse<LeaveDetailResponseDto>
                {
                    Data = result,
                    TotalData = result.Count
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                // Log error ตามต้องการ
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}

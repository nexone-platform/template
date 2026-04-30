using HrService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR.Protocol;
using Microsoft.EntityFrameworkCore;
using Middlewares.Models;
using static HrService.Controllers.PayrollController;
using static HrService.Services.SalaryService;

namespace HrService.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SalaryController : ControllerBase
    {
        private readonly SalaryService _salaryService;
        public SalaryController(SalaryService salaryService)
        {
            _salaryService = salaryService;
        }

        [HttpGet("byPaymentType")]
        public async Task<ActionResult<ApiResponse<EmployeePaymentDto>>> GetEmployeesByPaymentType([FromQuery] int paymentTypeId)
        {
            var response = await _salaryService.GetEmployeesByPaymentTypeAsync(paymentTypeId);
            return Ok(response);
        }

        [HttpGet("allEmployee")]
        public async Task<ActionResult<ApiResponse<EmployeePaymentDto>>> GetEmployees()
        {
            var response = await _salaryService.GetEmployeesAsync();
            return Ok(response);
        }

        [HttpGet("periods")]
        public async Task<ActionResult<ApiResponse<PeriodPayrollDto>>> GetAllPeriods()
        {
            // Get all payroll periods from the service
            var periods = await _salaryService.GetAllPeriodsAsync();

            // If no periods are found, return NotFound response
            if (periods == null || periods.Count == 0)
            {
                return NotFound(new { message = "No payroll periods found." });
            }

            // Create the ApiResponse for periods
            var response = new ApiResponse<PeriodPayrollDto>
            {
                Data = periods,
                TotalData = periods.Count
            };

            return Ok(response);
        }

        [HttpPost("search-periods")]
        public async Task<ActionResult<ApiResponse<PeriodPayrollDto>>> GetPeriods([FromBody] PeriodStatusRequest request)
        {
            // Get all payroll periods from the service
            var periods = await _salaryService.GetPeriodsAsync(request);

            // If no periods are found, return NotFound response
            if (periods == null || periods.Count == 0)
            {
                return NotFound(new { message = "No payroll periods found." });
            }

            // Create the ApiResponse for periods
            var response = new ApiResponse<PeriodPayrollDto>
            {
                Data = periods,
                TotalData = periods.Count
            };

            return Ok(response);
        }

        public class PeriodStatusRequest
        {
            public int? Status { get; set; } // Nullable integer
            public DateTime? Month { get; set; }
        }

        [HttpPost("periods/by-status")]
        public async Task<ActionResult<ApiResponse<PeriodPayrollDto>>> GetPeriodsByStatus([FromBody] PeriodStatusRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Request payload is required." });
            }

            // Fetch filtered periods from the salary service
            var periods = await _salaryService.GetPeriodsByStatusAndMonthAsync(request);

            // Handle no results case
            if (periods == null || periods.Count == 0)
            {
                string message = request.Status.HasValue
                    ? $"No payroll periods found with status '{request.Status}' and month '{request.Month?.ToString("MMMM yyyy") ?? "N/A"}'."
                    : "No payroll periods found.";
                return NotFound(new { message });
            }

            // Create response
            var response = new ApiResponse<PeriodPayrollDto>
            {
                Data = periods,
                TotalData = periods.Count
            };

            return Ok(response);
        }

        [HttpGet("SSO")]
        public async Task<ActionResult<ApiResponse<SocialSecurityRate>>> GetAllSocialSecurityRate()
        {
            // Get all payroll periods from the service
            var sso = await _salaryService.GetAllSocialSecurityRateAsync();

            // If no periods are found, return NotFound response
            if (sso == null || sso.Count == 0)
            {
                return NotFound(new { message = "No payroll periods found." });
            }

            // Create the ApiResponse for periods
            var response = new ApiResponse<SocialSecurityRate>
            {
                Data = sso,
                TotalData = sso.Count
            };

            return Ok(response);
        }

        // Get payroll data by periodId
        [HttpGet("payroll/{periodId}")]
        public async Task<ActionResult<ApiResponse<Payroll>>> GetPayrollByPeriod(int periodId)
        {
            // Get payroll data by periodId from the service
            var payrollData = await _salaryService.GetPayrollByPeriodIdAsync(periodId);

            // If no payroll data is found, return NotFound response
            if (payrollData == null || payrollData.Count == 0)
            {
                return NotFound(new { message = $"No payroll data found for period ID {periodId}." });
            }

            // Create the ApiResponse for payroll data
            var response = new ApiResponse<Payroll>
            {
                Data = payrollData,
                TotalData = payrollData.Count
            };

            return Ok(response);
        }

        [HttpPost("update-period-status")]
        public async Task<IActionResult> UpdatePeriodAndPayrollStatus([FromBody] UpdatePeriodStatusRequest request)
        {
            if (request == null || request.PeriodId <= 0)
            {
                return BadRequest(new { message = "Invalid request data." });
            }

            // Update the period status
            var periodResult = await _salaryService.UpdatePeriodStatusAsync(request.PeriodId, request.Status, request.Reason);

            if (!periodResult)
            {
                return NotFound(new { message = "Period not found or could not be updated." });
            }

            // Find and update related payroll
            var payrollResult = await _salaryService.UpdatePayrollStatusByPeriodAsync(request.PeriodId, request.Status);

            if (!payrollResult)
            {
                return NotFound(new { message = "Payroll not found or could not be updated." });
            }

            return Ok(new { message = "Period and payroll statuses updated successfully." });
        }

        [HttpPost("createPayroll")]
        public async Task<IActionResult> Create([FromBody] ApiRequest request)
        {
            if (request.TransactionData == null || request.EmployeeData == null)
                return BadRequest(new { message = "Invalid request data." });

            ServiceResponse result;

            // Check if PeriodId is present and greater than 0
            if (request.TransactionData.PeriodId > 0)
            {
                // Update Payroll
                result = await _salaryService.UpdatePayrollAsync(request);
            }
            else
            {
                // Create Payroll
                result = await _salaryService.CreatePayrollAsync(request);
            }

            if (!result.IsSuccess)
                return BadRequest(result.Message);

            return Ok(new { result.Message, result.PeriodId });
        }

        [HttpPost("getPayrollByPeriod")]
        public async Task<IActionResult> GetPayrollByParameters([FromBody] PeriodRequest request)
        {
            if (request == null || request.PaymentChannel == 0 || request.PaymentTypeId == 0 || request.PeriodId == 0)
            {
                return BadRequest(new { message = "Invalid parameters provided." });
            }

            var result = await _salaryService.GetPayrollDetailsByParametersAsync(
                request.PaymentChannel,
                request.PaymentTypeId,
                request.PeriodId
            );

            if (!result.IsSuccess)
            {
                return BadRequest(result.Message);
            }

            return Ok(result.Data);
        }

        [HttpGet("estimated-tax/{employeeId}")]
        public async Task<IActionResult> GetEstimatedTax(int employeeId)
        {
            try
            {
                var result = await _salaryService.GetEstimatedTaxAsync(employeeId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}

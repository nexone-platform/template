using HrService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Middlewares.Models;
using static HrService.Services.PayrollService;

namespace HrService.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class PayrollController : ControllerBase
    {
        private readonly PayrollService _payrollService;
        public PayrollController(PayrollService payrollService)
        {
            _payrollService = payrollService;
        }

        [HttpGet("year")]
        public IActionResult GetYears()
        {
            try
            {
                int currentYear = DateTime.Now.Year;
                IEnumerable<int> years = Enumerable.Range(currentYear, 6);

                return Ok(years);
            }
            catch (Exception ex)
            {
                // Return an error response in case of an exception
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpGet("{employeeId}")]
        public async Task<ActionResult<IEnumerable<PayrollWithEmployee>>> GetPayrollByEmployeeId(int employeeId)
        {
            var payrolls = await _payrollService.GetPayrollsByEmployeeIdAsync(employeeId);

            if (payrolls == null || payrolls.Count == 0)
            {
                return NotFound(new { message = $"No payroll records found for employee ID {employeeId}." });
            }

            return Ok(payrolls);
        }

        [HttpPost("GetPayrollsByYear")]
        public async Task<IActionResult> GetPayrollsByYear([FromBody] PayrollRequest request)
        {
            try
            {
                var response = await _payrollService.GetPayrollsByYearAsync(request.EmployeeId, request.Year);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = ex.Message,
                    Details = ex.InnerException?.Message
                });
            }
        }

        [HttpPost("GetPayrollsById")]
        public async Task<ActionResult<PayrollWithEmployee>> GetPayslip([FromBody] GetPayslipRequest request)
        {
            if (request == null || request.PayrollId <= 0)
            {
                return BadRequest(new { message = "Invalid request data. Please provide valid employeeId and payrollId." });
            }

            var payslip = await _payrollService.GetPayrollByIdAsync( request.PayrollId);

            if (payslip == null)
            {
                return NotFound(new { message = $"No payslip found for  payroll ID {request.PayrollId}." });
            }

            return Ok(payslip);
        }

        [HttpGet("payslip/{employeeId}")]
        public async Task<ActionResult<IEnumerable<PayrollWithEmployee>>> GetPayslipByEmployeeId(int employeeId)
        {
            var payrolls = await _payrollService.GetLastSalaryIdByEmployeeIdAsync(employeeId);

            if (payrolls == null)
            {
                return NotFound(new { message = $"No payroll records found for employee ID {employeeId}." });
            }

            return Ok(payrolls);
        }

        public class GetPayslipRequest
        {
            public int PayrollId { get; set; }
        }

        public class PayrollRequest
        {
            public int EmployeeId { get; set; }
            public int? Year { get; set; }  // ปีที่ต้องการ หรือ null เพื่อใช้ปีปัจจุบัน
        }

    }

}

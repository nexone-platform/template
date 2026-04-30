using AutoMapper;
using HrService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Middleware.Data;
using Middlewares;
using static HrService.Services.RegistrationService;

namespace HrService.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class RegistrationController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public T? Data { get; set; }
            public int TotalData { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly RegistrationService _registrationService;
        private readonly ILoggingService _loggingService;
        public RegistrationController(ApplicationDbContext context, IMapper mapper, RegistrationService registrationService, ILoggingService loggingService)
        {
            _mapper = mapper;
            _context = context;
            _registrationService = registrationService;
            _loggingService = loggingService;
        }

        [HttpGet("getAllWorkingYears")]
        public IActionResult GetAllWorkingYears()
        {
            var currentYear = DateTime.Now.Year;

            var employees = _context.Employees
                .Where(e => e.JoinDate != null)
                .ToList(); // ดึงข้อมูลมาก่อน

            var years = employees
                .SelectMany(e =>
                {
                    var startYear = e.JoinDate.Value.Year;
                    var endYear = e.ResignationDate?.Year ?? currentYear;

                    return Enumerable.Range(startYear, endYear - startYear + 1);
                })
                .Distinct()
                .OrderBy(y => y)
                .ToList();

            return Ok(years);
        }
        public class SearchEmployeeRequest
        {
            public int? Year { get; set; }
            public bool? IsActive { get; set; }
            public int? DepartmentId { get; set; }
            public int? GenderId { get; set; }
        }


        [HttpPost("search")]
        public async Task<IActionResult> SearchEmployees([FromBody] SearchEmployeeRequest request)
        {
            var result = await _registrationService.SearchEmployeesAsync(
                 request.Year,
                 request.IsActive,
                 request.DepartmentId,
                 request.GenderId
             );

            var response = new ApiResponse<List<EmployeeReportDto>>
            {
                Data = result,
                TotalData = result.Count
            };

            return Ok(response);
        }
    }
}

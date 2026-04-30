using AutoMapper;
using HrService.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using static HrService.Services.ReportTimesheetService;

namespace HrService.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ReportTimesheetController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ReportTimesheetService _reportTimesheetService;
        private readonly ILoggingService _loggingService;
        private readonly JasperReportService _jasperService;
        public ReportTimesheetController(ApplicationDbContext context, IMapper mapper, ReportTimesheetService reportTimesheetService, ILoggingService loggingService)
        {
            _mapper = mapper;
            _context = context;
            _reportTimesheetService = reportTimesheetService;
            _loggingService = loggingService;

/*            _jasperService = new JasperReportService(
              "jasperadmin",
              "jasperadmin",
              "http://localhost:8080/jasperserver/rest_v2/reports");*/
        }

        [HttpGet("monthly-summary")]
        public async Task<IActionResult> GetMonthlySummary(int? projectId = null, int? month = null, int? year = null)
        {
            var result = await _reportTimesheetService.GetMonthlySummaryAsync(projectId, month, year);
            return Ok(result);
        }

        [HttpGet("export")]
        public IActionResult ExportReport(
            [FromQuery] string employeeId,
            [FromQuery] string projectId,
            [FromQuery] string year,
            [FromQuery] string month)
        {
            var parameters = new Dictionary<string, string>
            {
                { "employeeId", employeeId },
                { "projectId", projectId },
                { "year", year },
                { "month", month }
            };

            string reportPath = "/reports/TimesheetReport.pdf";

            // สร้าง temp file path
            string tempFilePath = Path.GetTempFileName();

            // ดาวน์โหลดรายงานลงไฟล์ (sync)
  /*          _jasperService.DownloadReportToFile(reportPath, parameters, tempFilePath);*/

            // อ่านไฟล์เป็น stream
            var fileStream = new FileStream(tempFilePath, FileMode.Open, FileAccess.Read);

            // คืนไฟล์ PDF กลับ client พร้อม content-disposition ให้ดาวน์โหลด
            return File(fileStream, "application/pdf", "TimesheetReport.pdf");
        }
    }
}

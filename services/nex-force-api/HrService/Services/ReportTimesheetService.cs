using Azure.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Middleware.Data;
using Middlewares;
using System;
using System.Security.Claims;
namespace HrService.Services
{
    public class ReportTimesheetService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;


        public ReportTimesheetService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
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

        public class TimesheetReportDto
        {
            public int EmployeeId { get; set; }
            public string EmployeeName { get; set; }
            public int ProjectId { get; set; }
            public string ProjectName { get; set; }
            public decimal TotalWorkHours { get; set; }
            public decimal TotalOTHours { get; set; }
            public int TaskCount { get; set; }
            public string? ImgPath { get; set; }
            public int? Month { get; set; }
            public int? Year { get; set; }
        }

        public async Task<ApiResponse<TimesheetReportDto>> GetMonthlySummaryAsync(int? projectId = null, int? month = null, int? year = null)
        {
            var projects = await _context.Projects
                .Where(p => projectId == null || p.ProjectId == projectId)
                .Select(p => new {
                    p.ProjectId,
                    p.ProjectName,
                    p.TimesheetDateStart
                }).ToListAsync();

            var reportData = new List<TimesheetReportDto>();

            foreach (var proj in projects)
            {
                DateTime? startDate = null;
                DateTime? endDate = null;

                if (month.HasValue && year.HasValue && proj.TimesheetDateStart.HasValue)
                {
                    var startDay = proj.TimesheetDateStart.Value;
                    var safeDay = Math.Min(startDay, DateTime.DaysInMonth(year.Value, month.Value));
                    startDate = new DateTime(year.Value, month.Value, safeDay);
                    endDate = startDate.Value.AddMonths(1).AddDays(-1);
                }

                var query = from header in _context.Timesheets
                            join detail in _context.TimesheetDetails
                                on header.TimesheetHeaderId equals detail.TimesheetHeaderId
                            join emp in _context.Employees
                                on header.EmployeeId equals emp.Id
                            where header.ProjectId == proj.ProjectId
                                  && (!startDate.HasValue || (header.WorkDate >= startDate && header.WorkDate <= endDate))
                            group new { header, detail, emp } by new
                            {
                                header.EmployeeId,
                                emp.FirstNameEn,
                                emp.LastNameEn,
                                emp.ImgPath,
                                header.ProjectId,
                                proj.ProjectName
                            } into g
                            select new TimesheetReportDto
                            {
                                EmployeeId = g.Key.EmployeeId,
                                EmployeeName = g.Key.FirstNameEn + " " + g.Key.LastNameEn,
                                ProjectId = g.Key.ProjectId,
                                ProjectName = g.Key.ProjectName,
                                TotalWorkHours = g.Sum(x => x.detail.ActualHours ?? 0),
                                TotalOTHours = g.Sum(x => x.detail.OtHours ?? 0),
                                TaskCount = g.Select(x => x.header.WorkDate.Date).Distinct().Count(),
                                Month = g.Min(x => x.header.WorkDate).Month,
                                Year = g.Min(x => x.header.WorkDate).Year,
                                ImgPath = string.IsNullOrEmpty(g.Key.ImgPath)
                                              ? null
                                              : g.Key.ImgPath,
                            };

                reportData.AddRange(
                    await query
                        .OrderBy(x => x.Year)
                        .ThenBy(x => x.Month)
                        .ToListAsync());
            }

            return new ApiResponse<TimesheetReportDto>
            {
                Data = reportData,
                TotalData = reportData.Count
            };
        }
    }
}


using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Helpers;
using Middlewares.Models;
using static Middlewares.Constant.StatusConstant;
using static MongoDB.Driver.WriteConcern;
using static solutionAPI.Services.LeaveRequestService;
using static System.Net.WebRequestMethods;

namespace solutionAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class OvertimeController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public class OvertimeRequestDto
        {
            public decimal OvertimeId { get; set; }
            public DateTime? CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public DateTime? UpdateDate { get; set; }
            public string? UpdateBy { get; set; }
            public decimal EmployeeId { get; set; }
            public DateTime? OvertimeDate { get; set; }
            public decimal? Type { get; set; }
            public string? TypeName { get; set; }
            public string? Description { get; set; }
            public bool IsApproved { get; set; } = false;
            public decimal? ApprovedId { get; set; }
            public DateTime? ApprovalDate { get; set; }
            public string? Comments { get; set; }
            public string? Status { get; set; }
            public decimal? Hour { get; set; }
            public string? EmployeeName { get; set; }
            public string? ImgPath { get; set; }
            public string? ApprovedBy { get; set; }  // Approver's name
            public string? ApprovedByImgPath { get; set; }  // Approver's image path
            public decimal? Amount { get; set; }
            public string? OrganizationCode { get; set; }
            public decimal? RequestorId { get; set; }
            public int? ProjectId { get; set; }

            public string? Organization { get; set; }
            public string? Requestor { get; set; }
            public string? Project { get; set; }
        }

        private readonly ILoggingService _loggingService;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IServiceProvider _serviceProvider;
        public OvertimeController(ApplicationDbContext context, IMapper mapper, ILoggingService loggingService, IServiceProvider serviceProvider    )
        {
            _mapper = mapper;
            _loggingService = loggingService;
            _context = context;
            _serviceProvider = serviceProvider;
        }

        [HttpPost("getAllOvertime")]
        public async Task<ActionResult<ApiResponse<OvertimeRequestDto>>> GetAllOvertime([FromBody] OvertimeFilterRequest filter)
        {
            try
            {
                // Default values to null, meaning no filtering
                DateTime? startDate = null, endDate = null;

                if (!string.IsNullOrEmpty(filter.Month) &&
                    DateTime.TryParseExact(filter.Month, "yyyy-MM", null, System.Globalization.DateTimeStyles.None, out var parsedDate))
                {
                    int currentYear = parsedDate.Year;
                    int month = parsedDate.Month;

                    if (!string.IsNullOrEmpty(filter.Week) && int.TryParse(filter.Week, out var parsedWeek))
                    {
                        var firstDayOfMonth = new DateTime(currentYear, month, 1);
                        startDate = parsedWeek == 1 ? firstDayOfMonth : firstDayOfMonth.AddDays(14);
                        endDate = startDate.Value.AddDays(13).AddHours(23).AddMinutes(59).AddSeconds(59);
                    }
                    else
                    {
                        startDate = new DateTime(currentYear, month, 1);
                        endDate = startDate.Value.AddMonths(1).AddDays(-1).AddHours(23).AddMinutes(59).AddSeconds(59);
                    }
                }

                var organizationQuery = _context.Organizations.Select(org => new
                {
                    OrganizationCode = org.OrganizationCode,
                    OrganizationName = org.OrganizationNameEn
                }).Concat(
                    _context.Clients.Select(client => new
                    {
                        OrganizationCode = client.ClientCode,
                        OrganizationName = client.Company
                    })
                );

                // Query data without filtering if startDate and endDate are null
                var query = from r in _context.OvertimeRequests
                            join e in _context.Employees on r.EmployeeId equals e.Id into employees
                            from e in employees.DefaultIfEmpty()
                            join t in _context.OtTypes on r.Type equals t.OtTypeId into otTypes
                            from t in otTypes.DefaultIfEmpty()
                            join a in _context.Employees on r.ApprovedId equals a.Id into approvers
                            from approver in approvers.DefaultIfEmpty()
                            join p in _context.Projects on r.ProjectId equals p.ProjectId into projects
                            from project in projects.DefaultIfEmpty()
                            join o in organizationQuery on r.OrganizationCode equals o.OrganizationCode into orgs
                            from org in orgs.DefaultIfEmpty()
                            join emp in _context.Employees on r.RequestorId equals emp.Id into requestors
                            from requestor in requestors.DefaultIfEmpty()
                            select new OvertimeRequestDto
                            {
                                OvertimeId = r.OvertimeId,
                                EmployeeId = r.EmployeeId,
                                EmployeeName = e != null ? e.FirstNameEn + " " + e.LastNameEn : "Unknown Employee",
                                OvertimeDate = r.OvertimeDate,
                                Type = r.Type,
                                TypeName = t != null ? t.OtTypeNameEn : null,
                                Description = r.Description,
                                IsApproved = r.IsApproved,
                                ApprovedId = r.ApprovedId,
                                ApprovalDate = r.ApprovalDate,
                                ApprovedBy = approver != null ? approver.FirstNameEn + " " + approver.LastNameEn : null,
                                ApprovedByImgPath = approver != null && !string.IsNullOrEmpty(approver.ImgPath) ?
                                                    approver.ImgPath : null,
                                Comments = r.Comments,
                                Status = r.Status,
                                ImgPath = !string.IsNullOrEmpty(e.ImgPath) ?
                                          e.ImgPath : null,
                                CreateDate = r.CreateDate,
                                CreateBy = r.CreateBy,
                                UpdateDate = r.UpdateDate,
                                UpdateBy = r.UpdateBy,
                                Hour = r.Hour,
                                Amount = r.Amount,
                                ProjectId = r.ProjectId,
                                Project = project.ProjectName,
                                Organization = org.OrganizationName,
                                OrganizationCode = org.OrganizationCode,
                                RequestorId = r.RequestorId,
                                Requestor = requestor.FirstNameEn + " " + requestor.LastNameEn,
                            };

                // Apply filtering if needed
                if (startDate.HasValue && endDate.HasValue)
                {
                    query = query.Where(r => r.OvertimeDate >= startDate && r.OvertimeDate <= endDate);
                }
                query = query.OrderBy(r => r.Status == "New" ? 0
              : r.Status == "WaitForApprove" ? 1
              : r.Status == "Approved" ? 2
              : r.Status == "Declined" ? 3
              : 4).ThenBy(r => r.OvertimeDate);
                var overtimeRequests = await query.ToListAsync();

                var response = new ApiResponse<OvertimeRequestDto>
                {
                    Data = overtimeRequests,
                    TotalData = overtimeRequests.Count()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        public class OvertimeFilterDto
        {
            public int EmployeeId { get; set; }
            public DateTime RequestDate { get; set; }
            public int ProjectId { get; set; }
        }

        [HttpPost("getOvertimeByFilter")]
        public async Task<ActionResult<ApiResponse<OvertimeRequestDto>>> GetOvertimeByFilter([FromBody] OvertimeFilterDto filter)
        {
            var organizationQuery = _context.Organizations.Select(o => new
            {
                OrganizationCode = o.OrganizationCode,
                OrganizationName = o.OrganizationNameEn
            })
            .Concat(
                _context.Clients.Select(c => new
                {
                    OrganizationCode = c.ClientCode,
                    OrganizationName = c.Company
                })
            );

            var query = from r in _context.OvertimeRequests
                        join e in _context.Employees on r.EmployeeId equals e.Id
                        join t in _context.OtTypes on r.Type equals t.OtTypeId
                        join a in _context.Employees on r.ApprovedId equals a.Id into approvers
                        from approver in approvers.DefaultIfEmpty()
                        join p in _context.Projects on r.ProjectId equals p.ProjectId into projects
                        from project in projects.DefaultIfEmpty()
                        join o in organizationQuery on r.OrganizationCode equals o.OrganizationCode into orgs
                        from org in orgs.DefaultIfEmpty()
                        join emp in _context.Employees on r.RequestorId equals emp.Id into requestors
                        from requestor in requestors.DefaultIfEmpty()
                        where r.EmployeeId == filter.EmployeeId
                           && r.ProjectId == filter.ProjectId
                           && r.OvertimeDate.Value.Date == filter.RequestDate.Date
                        select new OvertimeRequestDto
                        {
                            OvertimeId = r.OvertimeId,
                            EmployeeId = r.EmployeeId,
                            EmployeeName = e.FirstNameEn + " " + e.LastNameEn,
                            OvertimeDate = r.OvertimeDate,
                            Type = r.Type,
                            TypeName = t.OtTypeNameEn,
                            Description = r.Description,
                            IsApproved = r.IsApproved,
                            ApprovedId = r.ApprovedId,
                            ApprovalDate = r.ApprovalDate,
                            ApprovedBy = approver != null ? approver.FirstNameEn + " " + approver.LastNameEn : null,
                            ApprovedByImgPath = approver != null && !string.IsNullOrEmpty(approver.ImgPath)
                                ? $"{Request.Scheme}://{Request.Host}/{approver.ImgPath}"
                                : null,
                            Comments = r.Comments,
                            Status = r.Status,
                            ImgPath = !string.IsNullOrEmpty(e.ImgPath)
                                ? $"{Request.Scheme}://{Request.Host}/{e.ImgPath}"
                                : null,
                            CreateDate = r.CreateDate,
                            CreateBy = r.CreateBy,
                            UpdateDate = r.UpdateDate,
                            UpdateBy = r.UpdateBy,
                            Hour = r.Hour,
                            Amount = r.Amount,
                            ProjectId = r.ProjectId,
                            Project = project.ProjectName,
                            Organization = org.OrganizationName,
                            OrganizationCode = org.OrganizationCode,
                            RequestorId = r.RequestorId,
                            Requestor = requestor.FirstNameEn + " " + requestor.LastNameEn
                        };

            var result = await query.ToListAsync();

            return Ok(new ApiResponse<OvertimeRequestDto>
            {
                Data = result,
                TotalData = result.Count
            });
        }

        [HttpPost("getAllOvertimeByRequestor/{id}")]
        public async Task<ActionResult<ApiResponse<OvertimeRequestDto>>> GetAllOvertimeByRequestor(int id, [FromBody] OvertimeFilterRequest filter)
        {
            try
            {
                var currentYear = DateTime.UtcNow.Year;

                // Parse month from the filter; default to the current month if invalid
                int month = DateTime.UtcNow.Month;
                if (!string.IsNullOrEmpty(filter.Month) &&
                    DateTime.TryParseExact(filter.Month, "yyyy-MM", null, System.Globalization.DateTimeStyles.None, out var parsedDate))
                {
                    month = parsedDate.Month;
                    currentYear = parsedDate.Year;
                }

                // Parse week from the filter
                int? week = null;
                if (!string.IsNullOrEmpty(filter.Week) && int.TryParse(filter.Week, out var parsedWeek))
                {
                    week = parsedWeek;
                }

                // Calculate date range based on parsed month and week
                DateTime startDate, endDate;
                if (week.HasValue)
                {
                    var firstDayOfMonth = new DateTime(currentYear, month, 1);
                    startDate = week == 1 ? firstDayOfMonth : firstDayOfMonth.AddDays(14);
                    endDate = startDate.AddDays(13).AddHours(23).AddMinutes(59).AddSeconds(59);
                }
                else
                {
                    startDate = new DateTime(currentYear, month, 1);
                    endDate = startDate.AddMonths(1).AddDays(-1).AddHours(23).AddMinutes(59).AddSeconds(59);
                }
                var organizationQuery = _context.Organizations.Select(org => new
                {
                    OrganizationCode = org.OrganizationCode,
                    OrganizationName = org.OrganizationNameEn
                }).Concat(
                    _context.Clients.Select(client => new
                    {
                        OrganizationCode = client.ClientCode,
                        OrganizationName = client.Company
                    })
                );
                // Query overtime requests filtered by employee ID and date range
                var overtimeRequests = await (from r in _context.OvertimeRequests
                                              join e in _context.Employees on r.EmployeeId equals e.Id
                                              join t in _context.OtTypes on r.Type equals t.OtTypeId into otType
                                              from types in otType.DefaultIfEmpty()
                                              join a in _context.Employees on r.ApprovedId equals a.Id into approvers
                                              from approver in approvers.DefaultIfEmpty()
                                              join p in _context.Projects on r.ProjectId equals p.ProjectId into projects
                                              from project in projects.DefaultIfEmpty()
                                              join o in organizationQuery on r.OrganizationCode equals o.OrganizationCode into orgs
                                              from org in orgs.DefaultIfEmpty()
                                              join emp in _context.Employees on r.RequestorId equals emp.Id into requestors
                                              from requestor in requestors.DefaultIfEmpty()
                                              where r.RequestorId == id && r.OvertimeDate >= startDate && r.OvertimeDate <= endDate
                                              select new OvertimeRequestDto
                                              {
                                                  OvertimeId = r.OvertimeId,
                                                  EmployeeId = r.EmployeeId,
                                                  EmployeeName = e.FirstNameEn + " " + e.LastNameEn,
                                                  OvertimeDate = r.OvertimeDate,
                                                  Type = r.Type,
                                                  TypeName = types != null ? types.OtTypeNameEn : null,
                                                  Description = r.Description,
                                                  IsApproved = r.IsApproved,
                                                  ApprovedId = r.ApprovedId,
                                                  ApprovalDate = r.ApprovalDate,
                                                  ApprovedBy = approver != null ? approver.FirstNameEn + " " + approver.LastNameEn : null,
                                                  ApprovedByImgPath = approver != null && !string.IsNullOrEmpty(approver.ImgPath) ?
                                                                      approver.ImgPath : null,
                                                  Comments = r.Comments,
                                                  Status = r.Status,
                                                  ImgPath = !string.IsNullOrEmpty(e.ImgPath) ?
                                                            e.ImgPath : null,
                                                  CreateDate = r.CreateDate,
                                                  CreateBy = r.CreateBy,
                                                  UpdateDate = r.UpdateDate,
                                                  UpdateBy = r.UpdateBy,
                                                  Hour = r.Hour,
                                                  Amount = r.Amount,
                                                  ProjectId = r.ProjectId,
                                                  Project = project.ProjectName,
                                                  Organization = org.OrganizationName,
                                                  OrganizationCode = org.OrganizationCode,
                                                  RequestorId = r.RequestorId,
                                                  Requestor = requestor.FirstNameEn + " " + requestor.LastNameEn,
                                              }).OrderBy(r => r.Status == "New" ? 0
                                              : r.Status == "WaitForApprove" ? 1
                                              : r.Status == "Approved" ? 2
                                              : r.Status == "Declined" ? 3
                                              : 4).ThenBy(r => r.OvertimeDate).ToListAsync();

                // Create and return the response
                var response = new ApiResponse<OvertimeRequestDto>
                {
                    Data = overtimeRequests,
                    TotalData = overtimeRequests.Count()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpPost("getAllOvertimeById/{id}")]
        public async Task<ActionResult<ApiResponse<OvertimeRequestDto>>> GetAllOvertimeById(int id, [FromBody] OvertimeFilterRequest filter)
        {
            try
            {
                var currentYear = DateTime.UtcNow.Year;

                // Parse month from the filter; default to the current month if invalid
                int month = DateTime.UtcNow.Month;
                if (!string.IsNullOrEmpty(filter.Month) &&
                    DateTime.TryParseExact(filter.Month, "yyyy-MM", null, System.Globalization.DateTimeStyles.None, out var parsedDate))
                {
                    month = parsedDate.Month;
                    currentYear = parsedDate.Year;
                }

                // Parse week from the filter
                int? week = null;
                if (!string.IsNullOrEmpty(filter.Week) && int.TryParse(filter.Week, out var parsedWeek))
                {
                    week = parsedWeek;
                }

                // Calculate date range based on parsed month and week
                DateTime startDate, endDate;
                if (week.HasValue)
                {
                    var firstDayOfMonth = new DateTime(currentYear, month, 1);
                    startDate = week == 1 ? firstDayOfMonth : firstDayOfMonth.AddDays(14);
                    endDate = startDate.AddDays(13).AddHours(23).AddMinutes(59).AddSeconds(59);
                }
                else
                {
                    startDate = new DateTime(currentYear, month, 1);
                    endDate = startDate.AddMonths(1).AddDays(-1).AddHours(23).AddMinutes(59).AddSeconds(59);
                }
                var organizationQuery = _context.Organizations.Select(org => new
                {
                    OrganizationCode = org.OrganizationCode,
                    OrganizationName = org.OrganizationNameEn
                }).Concat(
                    _context.Clients.Select(client => new
                    {
                        OrganizationCode = client.ClientCode,
                        OrganizationName = client.Company
                    })
                );
                // Query overtime requests filtered by employee ID and date range
                var overtimeRequests = await (from r in _context.OvertimeRequests
                                              join e in _context.Employees on r.EmployeeId equals e.Id
                                              join t in _context.OtTypes on r.Type equals t.OtTypeId into otType
                                              from types in otType.DefaultIfEmpty()
                                              join a in _context.Employees on r.ApprovedId equals a.Id into approvers
                                              from approver in approvers.DefaultIfEmpty()
                                              join p in _context.Projects on r.ProjectId equals p.ProjectId into projects
                                              from project in projects.DefaultIfEmpty()
                                              join o in organizationQuery on r.OrganizationCode equals o.OrganizationCode into orgs
                                              from org in orgs.DefaultIfEmpty()
                                              join emp in _context.Employees on r.RequestorId equals emp.Id into requestors
                                              from requestor in requestors.DefaultIfEmpty()
                                              where r.EmployeeId == id && r.OvertimeDate >= startDate && r.OvertimeDate <= endDate
                                              select new OvertimeRequestDto
                                              {
                                                  OvertimeId = r.OvertimeId,
                                                  EmployeeId = r.EmployeeId,
                                                  EmployeeName = e.FirstNameEn + " " + e.LastNameEn,
                                                  OvertimeDate = r.OvertimeDate,
                                                  Type = r.Type,
                                                  TypeName = types != null ? types.OtTypeNameEn : null,
                                                  Description = r.Description,
                                                  IsApproved = r.IsApproved,
                                                  ApprovedId = r.ApprovedId,
                                                  ApprovalDate = r.ApprovalDate,
                                                  ApprovedBy = approver != null ? approver.FirstNameEn + " " + approver.LastNameEn : null,
                                                  ApprovedByImgPath = approver != null && !string.IsNullOrEmpty(approver.ImgPath) ?
                                                                      approver.ImgPath : null,
                                                  Comments = r.Comments,
                                                  Status = r.Status,
                                                  ImgPath = !string.IsNullOrEmpty(e.ImgPath) ?
                                                            e.ImgPath : null,
                                                  CreateDate = r.CreateDate,
                                                  CreateBy = r.CreateBy,
                                                  UpdateDate = r.UpdateDate,
                                                  UpdateBy = r.UpdateBy,
                                                  Hour = r.Hour,
                                                  Amount = r.Amount,
                                                  ProjectId = r.ProjectId,
                                                  Project = project.ProjectName,
                                                  Organization = org.OrganizationName,
                                                  OrganizationCode = org.OrganizationCode,
                                                  RequestorId = r.RequestorId,
                                                  Requestor = requestor.FirstNameEn + " " + requestor.LastNameEn,
                                              }).OrderBy(r => r.Status == "New" ? 0
                                              : r.Status == "WaitForApprove" ? 1
                                              : r.Status == "Approved" ? 2
                                              : r.Status == "Declined" ? 3
                                              : 4).ThenBy(r => r.OvertimeDate).ToListAsync();

                // Create and return the response
                var response = new ApiResponse<OvertimeRequestDto>
                {
                    Data = overtimeRequests,
                    TotalData = overtimeRequests.Count()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        public class OvertimeStatistic
        {
            public string Name { get; set; }   // Label for each statistic
            public decimal Data { get; set; }      // Value of the statistic
        }
        public class OvertimeFilterRequest
        {
            public string? Month { get; set; } // String for month (e.g., "2024-11")
            public string? Week { get; set; }  // String for week (e.g., "1")
            public string? Lang { get; set; }
        }

        [HttpPost("statistics")]
        public async Task<ActionResult<List<OvertimeStatistic>>> GetOvertimeStatisticsAsync([FromBody] OvertimeFilterRequest filter)
        {
            try
            {
                var currentYear = DateTime.UtcNow.Year;

                // Parse month from the filter; default to the current month if invalid
                int month = DateTime.UtcNow.Month;
                if (!string.IsNullOrEmpty(filter.Month) &&
                    DateTime.TryParseExact(filter.Month, "yyyy-MM", null, System.Globalization.DateTimeStyles.None, out var parsedDate))
                {
                    month = parsedDate.Month;
                    currentYear = parsedDate.Year;
                }

                // Parse week from the filter
                int? week = null;
                if (!string.IsNullOrEmpty(filter.Week) && int.TryParse(filter.Week, out var parsedWeek))
                {
                    week = parsedWeek;
                }

                // Calculate date range based on parsed month and week
                DateTime startDate, endDate;
                if (week.HasValue)
                {
                    var firstDayOfMonth = new DateTime(currentYear, month, 1);
                    startDate = week == 1 ? firstDayOfMonth : firstDayOfMonth.AddDays(14);
                    endDate = startDate.AddDays(13).AddHours(23).AddMinutes(59).AddSeconds(59);
                }
                else
                {
                    startDate = new DateTime(currentYear, month, 1);
                    endDate = startDate.AddMonths(1).AddDays(-1).AddHours(23).AddMinutes(59).AddSeconds(59);
                }

                // Query ข้อมูลจากฐานข้อมูลตามช่วงวันที่
                var overtimeRequests = _context.OvertimeRequests
                    .Where(o => o.OvertimeDate >= startDate && o.OvertimeDate <= endDate);

                // สร้างสถิติต่าง ๆ
                var overtimeEmployees = await overtimeRequests.Select(o => o.EmployeeId).Distinct().CountAsync();
                var overtimeHours = await overtimeRequests.SumAsync(o => o.Hour ?? 0);
                var pendingStatuses = new[] { "New", "WaitForApprove" };
                var pendingRequests = await overtimeRequests.CountAsync(o => pendingStatuses.Contains(o.Status));
                var rejectedRequests = await overtimeRequests.CountAsync(o => o.Status == "Declined");
                var approvedAmount = await overtimeRequests.Where(o => o.Status == "Approved").SumAsync(o => o.Amount ?? 0);
                var pendingAmount = await overtimeRequests.Where(o => pendingStatuses.Contains(o.Status)).SumAsync(o => o.Amount ?? 0);
                var declinedAmount = await overtimeRequests.Where(o => o.Status == "Declined").SumAsync(o => o.Amount ?? 0);

                var lang = string.IsNullOrEmpty(filter.Lang) ? "en" : filter.Lang.ToLower();
                // Create the statistics list
                // จัด Label ตามภาษา
                var statistics = new List<OvertimeStatistic>
                {
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "จำนวนพนักงานที่ทำ OT" : "Overtime Employees",
                        Data = overtimeEmployees
                    },
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "จำนวนชั่วโมง OT" : "Overtime Hours",
                        Data = overtimeHours
                    },
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "คำขอที่รอดำเนินการ" : "Pending Requests",
                        Data = pendingRequests
                    },
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "คำขอที่ถูกปฏิเสธ" : "Rejected Requests",
                        Data = rejectedRequests
                    },
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "จำนวนเงินที่อนุมัติ" : "Approved Amount",
                        Data = approvedAmount
                    },
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "จำนวนเงินที่รอดำเนินการ" : "Pending Amount",
                        Data = pendingAmount
                    },
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "จำนวนเงินที่ถูกปฏิเสธ" : "Declined Amount",
                        Data = declinedAmount
                    }
                };

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpPost("statistics/{employeeId}")]
        public async Task<ActionResult<List<OvertimeStatistic>>> GetOvertimeStatisticsAsync(int? employeeId, [FromBody] OvertimeFilterRequest filter)
        {
            try
            {
                var currentYear = DateTime.UtcNow.Year;

                // Parse month from the filter; default to the current month if invalid
                int month = DateTime.UtcNow.Month;
                if (!string.IsNullOrEmpty(filter.Month) &&
                    DateTime.TryParseExact(filter.Month, "yyyy-MM", null, System.Globalization.DateTimeStyles.None, out var parsedDate))
                {
                    month = parsedDate.Month;
                    currentYear = parsedDate.Year;
                }

                // Parse week from the filter
                int? week = null;
                if (!string.IsNullOrEmpty(filter.Week) && int.TryParse(filter.Week, out var parsedWeek))
                {
                    week = parsedWeek;
                }

                // Calculate date range based on parsed month and week
                DateTime startDate, endDate;
                if (week.HasValue)
                {
                    var firstDayOfMonth = new DateTime(currentYear, month, 1);
                    startDate = week == 1 ? firstDayOfMonth : firstDayOfMonth.AddDays(14);
                    endDate = startDate.AddDays(13).AddHours(23).AddMinutes(59).AddSeconds(59);
                }
                else
                {
                    startDate = new DateTime(currentYear, month, 1);
                    endDate = startDate.AddMonths(1).AddDays(-1).AddHours(23).AddMinutes(59).AddSeconds(59);
                }

                // Build the query
                var query = _context.OvertimeRequests.AsQueryable();

                // Apply employeeId filter
                if (employeeId.HasValue)
                {
                    query = query.Where(o => o.EmployeeId == employeeId.Value);
                }

                // Apply date range filter
                query = query.Where(o => o.OvertimeDate.HasValue && o.OvertimeDate.Value >= startDate && o.OvertimeDate.Value <= endDate);

                // Calculate statistics
                var overtimeEmployees = await query.Select(o => o.EmployeeId).Distinct().CountAsync();
                var overtimeHours = await query.SumAsync(o => o.Hour ?? 0);
                var pendingStatuses = new[] { "New", "WaitForApprove" };
                var pendingRequests = await query.CountAsync(o => pendingStatuses.Contains(o.Status));
                var rejectedRequests = await query.CountAsync(o => o.Status == "Declined");
                var approvedAmount = await query.Where(o => o.Status == "Approved").SumAsync(o => o.Amount ?? 0);
                var pendingAmount = await query.Where(o => pendingStatuses.Contains(o.Status)).SumAsync(o => o.Amount ?? 0);
                var declinedAmount = await query.Where(o => o.Status == "Declined").SumAsync(o => o.Amount ?? 0);

                var lang = string.IsNullOrEmpty(filter.Lang) ? "en" : filter.Lang.ToLower();
                // Create the statistics list
                // จัด Label ตามภาษา
                var statistics = new List<OvertimeStatistic>
                {
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "จำนวนพนักงานที่ทำ OT" : "Overtime Employees",
                        Data = overtimeEmployees
                    },
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "จำนวนชั่วโมง OT" : "Overtime Hours",
                        Data = overtimeHours
                    },
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "คำขอที่รอดำเนินการ" : "Pending Requests",
                        Data = pendingRequests
                    },
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "คำขอที่ถูกปฏิเสธ" : "Rejected Requests",
                        Data = rejectedRequests
                    },
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "จำนวนเงินที่อนุมัติ" : "Approved Amount",
                        Data = approvedAmount
                    },
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "จำนวนเงินที่รอดำเนินการ" : "Pending Amount",
                        Data = pendingAmount
                    },
                    new OvertimeStatistic
                    {
                        Name = lang == "th" ? "จำนวนเงินที่ถูกปฏิเสธ" : "Declined Amount",
                        Data = declinedAmount
                    }
                };
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdateResignation([FromBody] UpdateOvertimeDto overtime)
        {
            try
            {
                if (overtime == null)
                {
                    return BadRequest(new { message = "Invalid overtime data." });
                }

                var overlappingRequest = await _context.OvertimeRequests
                    .Where(r => r.EmployeeId == overtime.EmployeeId &&
                                r.OvertimeId != overtime.OvertimeId &&
                                r.OvertimeDate.HasValue &&
                                r.OvertimeDate.Value.Date == overtime.OvertimeDate.Date)
                    .FirstOrDefaultAsync();

                if (overlappingRequest != null)
                {
                    return Conflict(new { message = "An overtime request already exists for this employee on the same date." });
                }
                // ค้นหา value จาก type
                var typeValue = await _context.OtTypes
                    .Where(t => t.OtTypeId == overtime.Type)
                    .Select(t => t.Value)
                    .FirstOrDefaultAsync();

                if (typeValue == null)
                {
                    return BadRequest(new { message = $"Type '{overtime.Type}' does not have a value defined." });
                }
                var employment = await _context.Employments
                            .Where(e => e.EmployeeId == overtime.EmployeeId)
                            .Select(e => new { e.Salary })
                            .FirstOrDefaultAsync();
                if (employment == null || employment.Salary <= 0)
                {
                    return BadRequest(new { message = "Salary information is not available for this employee." });
                }
                var dailyRate = employment.Salary / 30 / 8; // คำนวณอัตราต่อชั่วโมง
                var otAmount = dailyRate * typeValue * overtime.Hour; // คำนวณ OT Amount

                var refId = await _context.ApprovalReferences
                                .Where(r => EF.Functions.ILike(r.RefType, "overtime"))
                                .Select(r => r.RefId)
                                .FirstOrDefaultAsync();

                if (overtime.OvertimeId > 0)
                {
                    // Update existing resignation
                    var existingOvertime = await _context.OvertimeRequests
                        .FirstOrDefaultAsync(r => r.OvertimeId == overtime.OvertimeId);

                    if (existingOvertime == null)
                    {
                        return NotFound(new { message = $"Resignation with ID {overtime.OvertimeId} not found." });
                    }

                    // Update resignation fields
                    existingOvertime.EmployeeId = overtime.EmployeeId;
                    existingOvertime.Hour = overtime.Hour;
                    existingOvertime.Type = overtime.Type;
                    existingOvertime.OvertimeDate = overtime.OvertimeDate.ToUniversalTime();
                    existingOvertime.Description = overtime.Description;
                    existingOvertime.Amount = otAmount;
                    existingOvertime.UpdateDate = DateTime.UtcNow;
                    existingOvertime.UpdateBy = overtime.Username;
                    existingOvertime.OrganizationCode  = overtime.OrganizationCode;
                    existingOvertime.RequestorId = overtime.RequestorId;
                    existingOvertime.ProjectId = overtime.ProjectId;
                    existingOvertime.RefId = refId;
                    existingOvertime.CurrentApprovalLevel = existingOvertime.CurrentApprovalLevel;
                    _context.OvertimeRequests.Update(existingOvertime);

                    // เพิ่มการอัพเดต ApprovalStatus ถ้ามีอยู่แล้ว
                    var existingStatus = await _context.ApprovalStatuses
                        .FirstOrDefaultAsync(s => s.RefType == "overtime" && s.RefRequestId == existingOvertime.OvertimeId);

                    if (existingStatus != null)
                    {
                        existingStatus.UpdateDate = DateTime.UtcNow;
                        existingStatus.UpdateBy = overtime.Username;
                        existingStatus.Status = ApproveStatus.New.ToString(); // หรือ Pending
                        _context.ApprovalStatuses.Update(existingStatus);
                    }
                }
                else
                {
                    var lastId = await _context.OvertimeRequests
                        .MaxAsync(r => (int?)r.OvertimeId) ?? 0;  // ป้องกัน null

                    var overtimeId = lastId + 1;

                    // Create new resignation
                    var newOvertime = new OvertimeRequest
                    {   
                        OvertimeId = overtimeId,
                        EmployeeId = overtime.EmployeeId,
                        OvertimeDate = overtime.OvertimeDate.ToUniversalTime(),
                        Description = overtime.Description,
                        CreateDate = DateTime.UtcNow,
                        Status = ApproveStatus.New.ToString(),
                        CreateBy = overtime.Username,
                        Hour = overtime.Hour,
                        Type = overtime.Type,
                        Amount = otAmount ,
                        ProjectId = overtime.ProjectId,
                        RequestorId = overtime.RequestorId,
                        OrganizationCode = overtime.OrganizationCode,
                        RefId = refId,
                        CurrentApprovalLevel = 1
                    };
                    _context.OvertimeRequests.Add(newOvertime);

                    var emp = _context.Employees.Where(e => e.Id == overtime.EmployeeId).FirstOrDefault();
                    var values = new Dictionary<string, string>
                        {
                            { "EmployeeName", emp.FirstNameEn + " " + emp.LastNameEn },
                            { "OvertimeDate", overtime.OvertimeDate.ToUniversalTime().ToShortDateString() },
                            { "TotalHours", overtime.Hour.ToString() },
                            { "Reason", overtime.Description },
                        };

                    var languageCode = "en";
                    var (subject, message) = await EmailHelper.GetTemplateWithContentAsync(
                                                _serviceProvider,
                                                "OVERTIME_REQUEST_APPROVAL",
                                                values,
                                                languageCode
                                            );

                    if (string.IsNullOrWhiteSpace(emp.Email))
                        throw new InvalidOperationException("Employee email not found.");

                    if (string.IsNullOrWhiteSpace(subject) || string.IsNullOrWhiteSpace(message))
                        throw new InvalidOperationException("Email template not found or invalid.");

                    // ส่งอีเมล
                    await EmailHelper.SendEmailBySettingAsync(_serviceProvider, emp.Email, subject, message);
                    // var (subject, message) = await _emailService.GetTemplateWithContentAsync("OVERTIME_REQUEST_APPROVAL", values, languageCode);
                    /*
                                    if (!string.IsNullOrWhiteSpace(users.Email) &&
                                        !string.IsNullOrWhiteSpace(subject) &&
                                        !string.IsNullOrWhiteSpace(message))
                                    {
                                        await _emailService.SendEmailAsync(users.Email, subject, message);
                                    }
                                    else if (users.Email == null)
                                    {

                                        return BadRequest(new { message = "Email not found." });
                                    }*/
                    var ruleId = await _context.ApprovalSteps
                        .Where(s => s.RefId == refId && s.StepOrder == 1)
                        .Select(s => s.RuleId)
                        .FirstOrDefaultAsync();
                    var status = new ApprovalStatus
                    {
                        RefType = "overtime",
                        RefId = refId,
                        RefRequestId = newOvertime.OvertimeId,
                        Status = ApproveStatus.New.ToString(),
                        RequestedBy = (int)overtime.EmployeeId,
                        RequestedAt = DateTime.UtcNow,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = overtime.Username,
                        CurrentStepOrder = 1,
                        RuleId = ruleId
                    };

                    _context.ApprovalStatuses.Add(status);

                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Overtime saved successfully." });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "EmploymentService", "Username");
                throw;
            }
        }

        [HttpPost("approve/{id}")]
        public async Task<IActionResult> UpdateLeaveRequestStatus(decimal id, [FromBody] StatusRequest request)
        {
            var currentUser = request.Username; // Get the current user from the identity
            var approverId = request.ApproverId;

            try
            {
                var overtime = await _context.OvertimeRequests.FindAsync(id);
                if (overtime == null)
                {
                    throw new Exception("Resignations not found.");
                };

                // Update the leave request status based on the provided status
                overtime.Status = request.Status.ToString();
                overtime.Comments = request.Comments;
                overtime.UpdateDate = DateTime.UtcNow;
                overtime.UpdateBy = currentUser;
                overtime.ApprovedId = approverId;
                overtime.ApprovalDate = DateTime.UtcNow;

                overtime.OvertimeDate = overtime.OvertimeDate.HasValue ? overtime.OvertimeDate.Value.ToUniversalTime() : (DateTime?)null;
                overtime.CreateDate = overtime.CreateDate.HasValue ? overtime.CreateDate.Value.ToUniversalTime() : (DateTime?)null;


                // If the status is "Approved," make the employee inactive
                if (request.Status.ToString().Equals(LeaveRequestStatus.Approved.ToString(), StringComparison.OrdinalIgnoreCase))
                {
                    overtime.IsApproved = true;
                }
                _context.OvertimeRequests.Update(overtime);
                var emp = _context.Employees.Where(e => e.Id == overtime.EmployeeId).FirstOrDefault();
                var values = new Dictionary<string, string>
                    {
                        { "EmployeeName", emp.FirstNameEn + " " + emp.LastNameEn },
                        { "OvertimeDate", overtime.OvertimeDate.Value.ToUniversalTime().ToShortDateString() },
                        { "TotalHours", overtime.Hour.ToString() },
                        { "Reason", overtime.Description },
                    };

                var languageCode = "en";
                var (subject, message) = await EmailHelper.GetTemplateWithContentAsync(
                            _serviceProvider,
                            "OVERTIME_APPROVED",
                            values,
                            languageCode
                        );

                if (string.IsNullOrWhiteSpace(emp.Email))
                    throw new InvalidOperationException("Employee email not found.");

                if (string.IsNullOrWhiteSpace(subject) || string.IsNullOrWhiteSpace(message))
                    throw new InvalidOperationException("Email template not found or invalid.");

                // ส่งอีเมล
                await EmailHelper.SendEmailBySettingAsync(_serviceProvider, emp.Email, subject, message);
                // var (subject, message) = await _emailService.GetTemplateWithContentAsync("OVERTIME_APPROVED", values, languageCode);
                /*
                                if (!string.IsNullOrWhiteSpace(users.Email) &&
                                    !string.IsNullOrWhiteSpace(subject) &&
                                    !string.IsNullOrWhiteSpace(message))
                                {
                                    await _emailService.SendEmailAsync(users.Email, subject, message);
                                }
                                else if (users.Email == null)
                                {

                                    return BadRequest(new { message = "Email not found." });
                                }*/

                await _context.SaveChangesAsync();
                return Ok(overtime);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "update-Resignations-status", currentUser);
                return StatusCode(500, new { message = "An error occurred while updating the Resignations status." });
            }
        }

        [HttpGet("getOtType")]
        public async Task<ActionResult<IEnumerable<ApiResponse<IEnumerable<OtType>>>>> GetProjectType()
        {
            try
            {
                var types = await (from c in _context.OtTypes
                                          select new OtType
                                          {
                                              OtTypeId = c.OtTypeId,
                                              OtTypeNameEn = c.OtTypeNameEn,
                                              OtTypeNameTh = c.OtTypeNameTh,
                                              OtTypeCode = c.OtTypeCode,
                                              CreateDate = c.CreateDate,
                                              CreateBy = c.CreateBy,
                                              UpdateDate = c.UpdateDate,
                                              UpdateBy = c.UpdateBy,
                                              Value =  c.Value
                                          }).ToListAsync();

                var response = new ApiResponse<OtType>
                {
                    Data = types,
                    TotalData = types.Count
                };

                return Ok(response);

            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpPost("updateOtType")]
        public async Task<ActionResult<IEnumerable<OtType>>> CreateOrUpdateOTType([FromBody] OtType otType)
        {
            if (otType == null)
            {
                return BadRequest(new { message = "Invalid OT Type data." });
            }

            if (otType.OtTypeId > 0)
            {
                // Update existing OT Type
                var existingOtType = await _context.OtTypes
                    .FirstOrDefaultAsync(e => e.OtTypeId == otType.OtTypeId);
                if (existingOtType == null)
                {
                    return NotFound(new { message = $"OT Type with ID {otType.OtTypeId} not found." });
                }

                existingOtType.UpdateBy = otType.UpdateBy;
                existingOtType.UpdateDate = DateTime.UtcNow;
                existingOtType.OtTypeNameEn = otType.OtTypeNameEn;
                existingOtType.OtTypeNameTh = otType.OtTypeNameTh;
                existingOtType.OtTypeCode = otType.OtTypeCode;
                existingOtType.Value = otType.Value;

                _context.OtTypes.Update(existingOtType);
            }
            else
            {
                // Create new OT Type
                var maxId = await _context.OtTypes
                            .MaxAsync(e => (int?)e.OtTypeId);
                if (maxId == null)
                {
                    maxId = 1; // Initialize ID if the table is empty
                }
                else
                {
                    maxId = maxId + 1;
                }

                var newOtType = new OtType
                {
                    OtTypeId = (int)maxId,
                    OtTypeNameEn = otType.OtTypeNameEn,
                    OtTypeNameTh = otType.OtTypeNameTh,
                    OtTypeCode = otType.OtTypeCode,
                    Value = otType.Value,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = otType.UpdateBy, // Use a method to get the current user's ID
                };

                _context.OtTypes.Add(newOtType);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "OT Type saved successfully" });
        }

        [HttpGet("pendingApprovalCount")]
        public async Task<ActionResult<int>> GetPendingApprovalCountAsync()
        {
            try
            {
                var startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1).AddHours(23).AddMinutes(59).AddSeconds(59);
                var pendingStatuses = new[] { "New", "WaitForApprove" };

                var pendingCount = await _context.OvertimeRequests
                    .Where(o => pendingStatuses.Contains(o.Status)
                             && o.OvertimeDate >= startDate
                             && o.OvertimeDate <= endDate)
                    .CountAsync();

                return Ok(pendingCount);
            }
            catch (Exception ex)
            {
                // Handle errors gracefully
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOvertimeById(int id)
        {
            var overtime = await _context.OvertimeRequests
                .FirstOrDefaultAsync(o => o.OvertimeId == id);

            if (overtime == null)
                return NotFound(new { message = $"Overtime request {id} not found." });

            return Ok(overtime);
        }
        public class OvertimeDto
        {
            public decimal OvertimeId { get; set; }
            public decimal EmployeeId { get; set; }
            public DateTime OvertimeDate { get; set; }
            public string Description { get; set; }
            public bool IsApproved { get; set; }
            public decimal? ApprovedId { get; set; }
            public DateTime? ApprovalDate { get; set; }
            public string Comments { get; set; }
            public string Status { get; set; }
            public decimal? Hour { get; set; }
            public int? Type { get; set; }
            public decimal? Amount { get; set; }
            public bool? IsFromTimesheet { get; set; }
            public int? RequestorId { get; set; }
            public string OrganizationCode { get; set; }
            public int? ProjectId { get; set; }
        }


        public class UpdateOvertimeDto
        {
            public int OvertimeId { get; set; }
            public decimal EmployeeId { get; set; }
            public DateTime OvertimeDate { get; set; }
            public string Description { get; set; }
            public string Username { get; set; }
            public decimal? Hour { get; set; }
            public decimal? Type { get; set; }
            public string? OrganizationCode { get; set; }
            public decimal? RequestorId { get; set; }
            public int? ProjectId { get; set; }
        }
        public class StatusRequest
        {
            public ApproveStatus Status { get; set; }
            public decimal ApproverId { get; set; } // Assuming ApproverId is of type decimal
            public string? Username { get; set; }
            public string? Comments { get; set; }
        }
        [HttpDelete("deleteOtType")]
        public async Task<IActionResult> DeleteOtType(int id)
        {
            try
            {
                var otType = await _context.OtTypes.FindAsync(id);
                if (otType == null)
                {
                    return NotFound(new { message = "Overtime type not found" });
                }

                _context.OtTypes.Remove(otType);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Overtime type deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }
    }
}

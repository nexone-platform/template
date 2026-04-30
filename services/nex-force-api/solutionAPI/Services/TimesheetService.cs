using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.Blazor;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace solutionAPI.Services
{
    public class TimesheetService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        public TimesheetService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
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
        public async Task<string> CreateOrUpdateTimesheetAsync(TimesheetHeaderDto dto)
        {
            Timesheet header;

            if (dto.TimesheetHeaderId == null || dto.TimesheetHeaderId == 0)
            {
                // Create
                header = new Timesheet
                {
                    EmployeeId = dto.EmployeeId,
                    ProjectId = dto.ProjectId,
                    WorkDate = dto.WorkDate.Date.AddDays(1).ToUniversalTime(),
                    ProjectDeadline = dto.ProjectDeadline,
                    JobType = dto.JobType,
                    OrganizationCode = dto.OrganizationCode,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = dto.Username,
                    TotalOtHours = dto.TotalOtHours,
                    TotalWorkHours = dto.TotalWorkHours,
                };

                _context.Timesheets.Add(header);
                await _context.SaveChangesAsync(); // Save เพื่อให้มี TimesheetHeaderId
            }
            else
            {
                // Update
                header = await _context.Timesheets
                    .Include(h => h.Details)
                    .FirstOrDefaultAsync(h => h.TimesheetHeaderId == dto.TimesheetHeaderId.Value);

                if (header == null)
                    throw new Exception("Timesheet header not found");

                header.ProjectId = dto.ProjectId;
                header.WorkDate = dto.WorkDate.Date.AddDays(1).ToUniversalTime();
                header.ProjectDeadline = dto.ProjectDeadline;
                header.JobType = dto.JobType;
                header.OrganizationCode = dto.OrganizationCode;
                header.UpdateDate = DateTime.UtcNow;
                header.UpdateBy = dto.Username;
                header.TotalWorkHours = dto.TotalWorkHours;
                header.TotalOtHours = dto.TotalOtHours;
                // ลบ detail เก่าออก (สามารถปรับ logic เป็นเฉพาะ id ที่ไม่มีใน DTO ก็ได้)
                _context.TimesheetDetails.RemoveRange(header.Details);
            }

            // เพิ่ม detail ใหม่ทั้งหมด
            foreach (var d in dto.Details)
            {
                string? filePath = null;

                if (d.AttFile != null && d.AttFile.Length > 0)
                {
                    var uploadsFolder = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "wwwroot",
                        "uploads"
                    );

                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    // นามสกุลไฟล์
                    var extension = Path.GetExtension(d.AttFile.FileName);

                    // วันที่ + เวลา
                    var dateTimeNow = DateTime.Now.ToString("yyyyMMdd_HHmmssfff");

                    // ชื่อไฟล์ใหม่ (ไม่ใช้ชื่อไฟล์เดิม)
                    var uniqueFileName = $"{dateTimeNow}_{Guid.NewGuid()}{extension}";
                    var savePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var stream = new FileStream(savePath, FileMode.Create))
                    {
                        await d.AttFile.CopyToAsync(stream);
                    }

                    // path สำหรับเก็บใน DB / ส่ง frontend
                    filePath = Path.Combine("uploads", uniqueFileName).Replace("\\", "/");
                }
                var detail = new TimesheetDetail
                {
                    TimesheetHeaderId = header.TimesheetHeaderId,
                    WorkName = d.WorkName,
                    StartTime = d.StartTime,
                    EndTime = d.EndTime,
                    ActualHours = d.ActualHours,
                    OtHours = d.IsOt ? d.OtHours ?? d.ActualHours : 0,
                    WorkPercentage = d.WorkPercentage,
                    TaskId = d.TaskId,
                    TaskBoardId = d.TaskBoardId,
                    IsOt = d.IsOt,
                    WorkDescription = d.WorkDescription,
                    ProblemDescription = d.ProblemDescription,
                    OtId = d.OtId,
                    AttFile = filePath,
                    ProblemResolve = d.ProblemResolve
                };

                _context.TimesheetDetails.Add(detail);
 
            }

            await _context.SaveChangesAsync();
            return "Save Timeshetet successfully";
        }

        public class TimesheetHeaderRespond
        {
            public int TimesheetHeaderId { get; set; }
            public DateTime? CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public DateTime? UpdateDate { get; set; }
            public string? UpdateBy { get; set; }
            public int EmployeeId { get; set; }
            public string EmployeeName { get; set; } = string.Empty;
            public int ProjectId { get; set; }
            public string ProjectName { get; set; } = "N/A";
            public DateTime? ProjectDeadline { get; set; }
            public DateTime WorkDate { get; set; }
            public string? JobType { get; set; }
            public string? OrganizationCode { get; set; }
            public string? OrganizationName { get; set; }
            public string? ImgPath { get; set; }
            public decimal? TotalWorkHours { get; set; }
            public decimal? TotalOtHours { get; set; }
            public List<TimesheetDetailRespond> Details { get; set; } = new();
        }

        public class TimesheetDetailRespond
        {
            public int TimesheetId { get; set; }
            public string WorkName { get; set; } = string.Empty;
            public TimeSpan StartTime { get; set; }
            public TimeSpan EndTime { get; set; }
            public decimal? ActualHours { get; set; }
            public decimal? OtHours { get; set; }
            public decimal? WorkPercentage { get; set; }
            public int? TaskId { get; set; }
            public int? TaskBoardId { get; set; }
            public bool IsOt { get; set; }
            public string? WorkDescription { get; set; }
            public string? ProblemDescription { get; set; }
            public string? AttFile { get; set; }
            public int? OtId { get; set; }
            public string? Comments { get; set; }
            public string? Project { get; set; }
            public string? ProblemResolve { get; set; }

        }

        public async Task<IEnumerable<TimesheetHeaderRespond>> GetAllTimesheetsAsync(int empId)
        {
            var request = _httpContextAccessor.HttpContext.Request;

            var organizations = await _context.Organizations
                .Select(org => new { org.OrganizationCode, OrganizationName = org.OrganizationNameTh })
                .ToListAsync();

            var clients = await _context.Clients
                .Select(client => new { OrganizationCode = client.ClientCode, OrganizationName = client.Company })
                .ToListAsync();

            var combinedOrganizations = organizations.Concat(clients).ToList();

            var timesheetEntities = await _context.Timesheets
                .Where(h => h.EmployeeId == empId)
                .Include(h => h.Details)
                .Join(_context.Employees, h => h.EmployeeId, e => e.Id, (h, e) => new { h, e })
                .GroupJoin(_context.Projects, x => x.h.ProjectId, p => p.ProjectId, (x, pGroup) => new { x.h, x.e, p = pGroup.FirstOrDefault() })
                .OrderByDescending(x => x.h.WorkDate)
                .AsNoTracking()
                .ToListAsync(); // <--- ดึงมาเป็น Object ก่อน

            // 1. Get all OT IDs
            var allOtIds = timesheetEntities.SelectMany(t => t.h.Details)
                .Where(d => d.OtId != null)
                .Select(d => d.OtId.Value)
                .Distinct()
                .ToList();

            var otWithProjects = await _context.OvertimeRequests
               .Where(o => allOtIds.Contains(o.OvertimeId))
               .GroupJoin(_context.Projects,
                   ot => ot.ProjectId,
                   p => p.ProjectId,
                   (ot, projects) => new
                   {
                       ot.OvertimeId,
                       ot.Comments,
                       ProjectName = projects.FirstOrDefault().ProjectName // Null if no project
                   })
               .ToDictionaryAsync(x => x.OvertimeId);

            var timesheets = timesheetEntities.Select(data => new TimesheetHeaderRespond
            {
                TimesheetHeaderId = data.h.TimesheetHeaderId,
                CreateDate = data.h.CreateDate,
                CreateBy = data.h.CreateBy,
                UpdateDate = data.h.UpdateDate,
                UpdateBy = data.h.UpdateBy,
                EmployeeId = data.h.EmployeeId,
                EmployeeName = $"{data.e.FirstNameEn} {data.e.LastNameEn}",
                ProjectId = data.h.ProjectId,
                ProjectName = data.p != null ? data.p.ProjectName : "N/A",
                ProjectDeadline = data.h.ProjectDeadline,
                WorkDate = data.h.WorkDate,
                JobType = data.h.JobType,
                OrganizationCode = data.h.OrganizationCode,
                TotalWorkHours = data.h.TotalWorkHours ?? 0,
                TotalOtHours = data.h.TotalOtHours ?? 0,
                ImgPath = string.IsNullOrEmpty(data.e.ImgPath)
                    ? null
                    : data.e.ImgPath,

                Details = data.h.Details.Select(d =>
                {
                    otWithProjects.TryGetValue(d.OtId ?? 0, out var ot);

                    return new TimesheetDetailRespond
                    {
                        TimesheetId = d.TimesheetId,
                        WorkName = d.WorkName,
                        StartTime = d.StartTime,
                        EndTime = d.EndTime,
                        ActualHours = d.ActualHours,
                        OtHours = d.OtHours,
                        WorkPercentage = d.WorkPercentage,
                        TaskId = d.TaskId,
                        TaskBoardId = d.TaskBoardId,
                        IsOt = d.IsOt,
                        WorkDescription = d.WorkDescription,
                        ProblemDescription = d.ProblemDescription,
                        ProblemResolve = d.ProblemResolve,
                        OtId = d.OtId,
                        Comments = ot?.Comments,
                        Project = ot?.ProjectName,
                        AttFile =  string.IsNullOrEmpty(d.AttFile)
                    ? null
                    : d.AttFile,
                    };
                }).ToList()
            }).ToList();

            // เติมชื่อองค์กร
            foreach (var t in timesheets)
            {
                t.OrganizationName = combinedOrganizations
                    .FirstOrDefault(o => o.OrganizationCode == t.OrganizationCode)?.OrganizationName ?? "N/A";
            }

            return timesheets;
        }

        public async Task<TimesheetHeaderRespond> GetTimesheetByIdAsync(int timesheetHeaderId)
        {
            var request = _httpContextAccessor.HttpContext.Request;

            // ดึงชื่อองค์กรทั้งหมด
            var organizations = await _context.Organizations
                .Select(org => new { org.OrganizationNameTh, org.OrganizationCode })
                .ToListAsync();

            var clients = await _context.Clients
                .Select(client => new { OrganizationNameTh = client.Company, OrganizationCode = client.ClientCode })
                .ToListAsync();

            var combinedOrganizations = organizations.Concat(clients).ToList();

            var result = await _context.Timesheets
                .Where(h => h.TimesheetHeaderId == timesheetHeaderId)
                .Include(h => h.Details)
                .Join(_context.Employees, h => h.EmployeeId, e => e.Id, (h, e) => new { h, e })
                .GroupJoin(_context.Projects, he => he.h.ProjectId, p => p.ProjectId, (he, projectGroup) => new
                {
                    he.h,
                    he.e,
                    p = projectGroup.FirstOrDefault()
                })
                .Select(data => new TimesheetHeaderRespond
                {
                    TimesheetHeaderId = data.h.TimesheetHeaderId,
                    CreateDate = data.h.CreateDate,
                    CreateBy = data.h.CreateBy,
                    UpdateDate = data.h.UpdateDate,
                    UpdateBy = data.h.UpdateBy,
                    EmployeeId = data.h.EmployeeId,
                    EmployeeName = $"{data.e.FirstNameEn} {data.e.LastNameEn}",
                    ProjectId = data.h.ProjectId,
                    ProjectName = data.p != null ? data.p.ProjectName : "N/A",
                    ProjectDeadline = data.h.ProjectDeadline,
                    WorkDate = data.h.WorkDate,
                    JobType = data.h.JobType,
                    OrganizationCode = data.h.OrganizationCode,
                    ImgPath = string.IsNullOrEmpty(data.e.ImgPath)
                        ? null
                        : data.e.ImgPath,
                    TotalOtHours =data.h.TotalOtHours??0,
                    TotalWorkHours = data.h.TotalWorkHours??0,
                    Details = data.h.Details.Select(d => new TimesheetDetailRespond
                    {
                        TimesheetId = d.TimesheetId,
                        WorkName = d.WorkName,
                        StartTime = d.StartTime,
                        EndTime = d.EndTime,
                        ActualHours = d.ActualHours,
                        OtHours = d.OtHours,
                        WorkPercentage = d.WorkPercentage,
                        TaskId = d.TaskId,
                        TaskBoardId = d.TaskBoardId,
                        IsOt = d.IsOt,
                        WorkDescription = d.WorkDescription,
                        ProblemDescription = d.ProblemDescription,
                        ProblemResolve = d.ProblemResolve,
                        OtId = d.OtId,
                        Comments = _context.OvertimeRequests
                            .Where(o => o.OvertimeId == d.OtId)
                            .Select(o => o.Comments)
                            .FirstOrDefault(),

                        // Join with Project via OvertimeRequests
                        Project = _context.OvertimeRequests
                            .Where(o => o.OvertimeId == d.OtId)
                            .Join(_context.Projects, o => o.ProjectId, p => p.ProjectId, (o, p) => p.ProjectName)
                            .FirstOrDefault(),

                        AttFile = string.IsNullOrEmpty(d.AttFile)
                    ? null
                    : d.AttFile,
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (result != null)
            {
                result.OrganizationName = combinedOrganizations
                    .FirstOrDefault(o => o.OrganizationCode == result.OrganizationCode)?.OrganizationNameTh ?? "N/A";
            }

            return result;
        }

        public class TimesheetDetailDto
        {
            public int TimesheetId { get; set; }
            public string WorkName { get; set; } = string.Empty;
            public TimeSpan StartTime { get; set; }
            public TimeSpan EndTime { get; set; }
            public decimal? ActualHours { get; set; }
            public decimal? OtHours { get; set; }
            public decimal? WorkPercentage { get; set; }
            public int? TaskId { get; set; }
            public int? TaskBoardId { get; set; }
            public bool IsOt { get; set; } = true;
            public string? WorkDescription { get; set; }
            public string? ProblemDescription { get; set; }
            public int? OtId { get; set; }
            public string? ProblemResolve { get; set; }
            public IFormFile? AttFile { get; set; }
        }

        public class TimesheetHeaderDto
        {
            public int? TimesheetHeaderId { get; set; }
            public int EmployeeId { get; set; }
            public int ProjectId { get; set; }
            public DateTime WorkDate { get; set; }
            public DateTime? ProjectDeadline { get; set; }
            public string? JobType { get; set; }
            public string? OrganizationCode { get; set; }
            public string Username { get; set; }
            public decimal? TotalWorkHours { get; set; }
            public decimal? TotalOtHours { get; set; }
            public List<TimesheetDetailDto> Details { get; set; }
        }


    }
}

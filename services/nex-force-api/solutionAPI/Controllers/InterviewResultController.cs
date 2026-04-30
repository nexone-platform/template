using solutionAPI.Services;
using AutoMapper;
using Consul;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares.Models;
using System.Linq;
using System.Security.Claims;
using static solutionAPI.Controllers.DesignationsController;
using static solutionAPI.Controllers.InterviewResultController;
using static solutionAPI.Controllers.ManageResumeController;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class InterviewResultController : ControllerBase
    {
        public class ApiResponse<T> 
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;
        private readonly IMapper _mapper;
        public InterviewResultController(ApplicationDbContext context, IMapper mapper, EmailService emailService)
        {
            _mapper = mapper;
            _context = context;
            _emailService = emailService;
        }

        [HttpGet("getAllInterview")]
        public async Task<ActionResult<ApiResponse<InterviewResultDto>>> GetAllInterview()
        {
            // LEFT JOIN
            var query =
                from j in _context.ManageResume

                join i0 in _context.InterviewResult
                    on j.ManageResumeId equals i0.ManageResumeId into inr
                from i in inr.DefaultIfEmpty()

                join p0 in _context.Designations
                    on j.Position equals p0.DesignationId into pst
                from p in pst.DefaultIfEmpty()

                join l0 in _context.Clients
                    on j.Location equals l0.ClientId into lct
                from l in lct.DefaultIfEmpty()

                join t0 in _context.Title
                    on j.Title equals t0.TitleID into tte
                from t in tte.DefaultIfEmpty()

                join s0 in _context.ScheduleTiming
                    on j.ManageResumeId equals s0.ManageResumeId into scdt
                from s in scdt.DefaultIfEmpty()

                join mj0 in _context.ManageJobs
                    on s.JobTitleId equals mj0.ManageJobId into mjt   // ← ปรับชื่อ field ให้ตรง Entity จริง
                from mj in mjt.DefaultIfEmpty()

                join d0 in _context.Departments
                    on mj.Department equals d0.DepartmentId into dct
                from d in dct.DefaultIfEmpty()

                select new InterviewResultDto
                {
                    ManageResumeId = j.ManageResumeId,

                    // FK ids
                    PositionId = j.Position,
                    LocationId = j.Location,
                    TitleId    = j.Title,
                    JobTitleId = s.JobTitleId,
                    DepartmentId = d.DepartmentId,
                    ClientId = l.ClientId,
                    InterviewResultId = i.InterviewResultId,

                    // Display names (ป้องกัน null)
                    PositionName = p.DesignationNameTh ?? p.DesignationNameEn,
                    LocationName = l.Company ,
                    TitleName    = t.TitleNameTh ?? t.TitleNameEn ?? t.TitleNameCode,
                    JobTitleName = mj.JobTitle,
                    DepartmentName = d.DepartmentNameEn,
                    ClientName = l.Company,
                    DateInternal = i.DateInternal,
                    DateExternal = i.DateExternal,
                    StatusInternal = i.StatusInternal,
                    StatusExternal = i.StatusExternal,
                    Comment = i.Comment,
                    Step = i.Step,

                    // ฟิลด์อื่น ๆ (ป้องกัน null)
                    ScheduleId = s.ScheduleId,
                    Title = t.TitleNameEn,
                    FirstName = j.FirstName,
                    LastName = j.LastName,
                    Email = j.Email,
                    StartDate = s.StartDate,
                    ExpiredDate = s.ExpiredDate,
                    JobTitle = mj.JobTitle,
                    Status = s.Status,
                    Experiences = j.Experiences,
                    Educations = j.Educations,
                    CreateDate = j.CreateDate,
                    CreateBy = j.CreateBy,
                    UpdateDate = j.UpdateDate,
                    UpdateBy = j.UpdateBy,
                    Phone = j.Phone,
                    Position = p.DesignationNameEn,
                    Location = l.Company,
                    Skills = j.Skills,
                    Gender = j.Gender,
                };

            // ถ้าไม่ต้องการกันแถวซ้ำ สามารถใช้ GroupBy เหมือนเดิม
            var list = await query
                .GroupBy(x => x.ManageResumeId)
            .Select(g => g.First())
            .ToListAsync();

            var response = new ApiResponse<InterviewResultDto>
            {
                Data = list,
                TotalData = list.Count
            };

            return Ok(response);
        }


        //[HttpGet("getManageResumeById/{id:int}")]
        //public async Task<ActionResult<ManageResumeDto>> GetManageResumeById(int id)
        //{
        //    // ถ้า j.Position / j.Location เป็น int? ให้ cast ด้านขวาเป็น int? ให้ตรงชนิด
        //    var dto = await (
        //        from j in _context.ManageResume
        //        where j.ManageResumeId == id

        //        // Position (Designation)
        //        join d0 in _context.Designations
        //            on j.Position equals d0.DesignationId into dgrp
        //        from d in dgrp.DefaultIfEmpty()

        //            // Location (Client)
        //        join c0 in _context.Clients
        //            on j.Location equals c0.ClientId into cgrp
        //        from c in cgrp.DefaultIfEmpty()

        //        join t0 in _context.Title
        //            on j.Title equals t0.TitleID into tte
        //        from t in tte.DefaultIfEmpty()

        //        select new ManageResumeDto
        //        {
        //            ManageResumeId = j.ManageResumeId,

        //            // FK + display
        //            PositionId = j.Position,
        //            PositionName = d.DesignationNameTh ?? d.DesignationNameEn ?? d.DesignationCode,
        //            LocationId = j.Location,
        //            LocationName = c.ClientCode ?? c.ClientNameEn ?? c.ClientNameTh,
        //            TitleId = j.Title,
        //            TitleName = t.TitleNameEn ?? t.TitleNameTh ?? t.TitleNameCode,

        //            // fields
        //            Title = t.TitleNameEn,
        //            FirstName = j.FirstName,
        //            LastName = j.LastName,
        //            Phone = j.Phone,
        //            Email = j.Email,
        //            Gender = j.Gender,
        //            Position = d.DesignationNameEn,
        //            Location = c.ClientNameEn,
        //            Skills = j.Skills,
        //            Experiences = j.Experiences,
        //            Educations = j.Educations,
        //            CreateBy = j.CreateBy,
        //            CreateDate = j.CreateDate,
        //            UpdateBy = j.UpdateBy,
        //            UpdateDate = j.UpdateDate
        //        }
        //    ).FirstOrDefaultAsync();

        //    if (dto == null)
        //        return NotFound(new { message = $"Resume with ID {id} not found." });

        //    return Ok(dto);
        //}


        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdateInterviewResult([FromBody] InterviewResult interviewResult)
        {
            if (interviewResult == null) return BadRequest(new { message = "Invalid interview Result data." });

            try
            {
                Console.WriteLine(">>> CreateOrUpdateInterviewResult CALLED");
                if (interviewResult.InterviewResultId > 0)
                {
                    var existing = await _context.InterviewResult
                        .FirstOrDefaultAsync(e => e.InterviewResultId == interviewResult.InterviewResultId);
                    if (existing == null) return NotFound(new { message = $"Schedule Timing with ID {interviewResult.InterviewResultId} not found." });

                    existing.UpdateBy = interviewResult.UpdateBy;
                    existing.UpdateDate = DateTime.UtcNow;
                    existing.ManageResumeId = interviewResult.ManageResumeId;
                    existing.ScheduleId = interviewResult.ScheduleId;
                    existing.DepartmentId = interviewResult.DepartmentId;
                    existing.DateInternal = interviewResult.DateInternal;
                    existing.DateExternal = interviewResult.DateExternal;
                    existing.StatusInternal = interviewResult.StatusInternal;
                    existing.StatusExternal = interviewResult.StatusExternal;
                    existing.Comment = interviewResult.Comment;
                    existing.Step = interviewResult.Step;

                    _context.InterviewResult.Update(existing);
                }
                else
                {
                    var maxId = await _context.InterviewResult
                                .MaxAsync(e => (int?)e.InterviewResultId);
                    if (maxId == null)
                    {
                        // Handle the case where the table is empty
                        maxId = 1;
                    }
                    else
                    {
                        maxId = maxId + 1;
                    }

                    var newDocument = new InterviewResult
                    {
                        InterviewResultId = (int)maxId,
                        ManageResumeId = interviewResult.ManageResumeId,
                        ScheduleId = interviewResult.ScheduleId,
                        DepartmentId = interviewResult.DepartmentId,
                        DateInternal = interviewResult.DateInternal,
                        DateExternal = interviewResult.DateExternal,
                        StatusInternal = interviewResult.StatusInternal,
                        StatusExternal = interviewResult.StatusExternal,
                        Comment = interviewResult.Comment,
                        Step = interviewResult.Step,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = interviewResult.CreateBy
                    };

                    _context.InterviewResult.Add(newDocument);
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Interview Result save successfully" });
            }
            catch (DbUpdateException ex)
            {
                // ดู ex.Message / ex.InnerException?.Message เพื่อตอบลูกความยาวเกิน/constraint
                return StatusCode(409, new { message = "DB constraint failed", detail = ex.InnerException?.Message ?? ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", detail = ex.Message });
            }
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteInterviewResult(int id)
        {
            // Find the holiday by its ID
            var interviewResult = await _context.InterviewResult.FindAsync(id);
            if (interviewResult == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "Interview Result not found" });
            }

            // Remove the holiday from the database
            _context.InterviewResult.Remove(interviewResult);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "Interview Result deleted successfully" });
        }

        [HttpGet("getAllEmployeeType")]
        public async Task<List<object>> GetEmployeeTypeAsync()
        {
            return await _context.Set<EmployeeType>() // entity map -> [Table("emp-tb-ms-employee-type")]
                .OrderBy(x => x.EmployeeTypeId)
                .Select(x => new {
                    employee_type_id = x.EmployeeTypeId,
                    employee_type_code = x.EmployeeTypeCode,
                    employee_type_name_en = x.EmployeeTypeNameEn
                })
                .ToListAsync<object>();
        }

        [HttpGet("getAllLocationJob")]
        public async Task<List<object>> GetLocationJobAsync()
        {
            return await _context.Set<Client>() // entity map -> [Table("emp-tb-ms-employee-type")]
                .OrderBy(x => x.ClientId)
                .Select(x => new {
                    client_id = x.ClientId,
                    client_code = x.ClientCode,
                    client_name_en = x.Company
                })
                .ToListAsync<object>();
        }

        [HttpGet("getAllDesignation")]
        public async Task<List<object>> GetLDesignationAsync()
        {
            return await _context.Set<Designation>() // entity map -> [Table("emp-tb-ms-employee-type")]
                .OrderBy(x => x.DesignationId)
                .Select(x => new {
                    designation_id = x.DesignationId,
                    designation_code = x.DesignationCode,
                    designation_name_en = x.DesignationNameEn
                })
                .ToListAsync<object>();
        }

        [HttpGet("getAllTitle")]
        public async Task<List<object>> GetTitleNameAsync()
        {
            return await _context.Set<Title>()
                .OrderBy(x => x.TitleID)
                .Select(x => new
                {
                    titleId = x.TitleID,
                    titleNameTh = x.TitleNameTh,
                    titleNameEn = x.TitleNameEn,
                    titleNameCode = x.TitleNameCode
                })
                .ToListAsync<object>();
        }

        public class InterviewResultSearchDto
        {
            public string? FirstName { get; set; }
            public int? Position { get; set; }   // = PositionId
            public string? Status { get; set; }
        }

        [HttpPost("searchInterviewResult")]
        public async Task<ActionResult<ApiResponse<InterviewResultDto>>> SearchResume(
            [FromBody] InterviewResultSearchDto searchDto)
        {
            // Base query + LEFT JOIN
            var query =
                from j in _context.ManageResume.AsNoTracking()

                    // Location
                join s0 in _context.ScheduleTiming.AsNoTracking()
                    on j.ManageResumeId equals s0.ManageResumeId into mnar
                from s in mnar.DefaultIfEmpty()

                // Position
                join p0 in _context.Designations.AsNoTracking()
                    on j.Position equals p0.DesignationId into pgrp
                from p in pgrp.DefaultIfEmpty()

                join t0 in _context.Title
                    on j.Title equals t0.TitleID into tte
                from t in tte.DefaultIfEmpty()

                select new
                {
                    j,                        // entity หลัก
                    s,
                    PositionName = p.DesignationNameEn,
                    titleName = t.TitleNameEn
                };

            // ---------- Filters ----------
            if (!string.IsNullOrWhiteSpace(searchDto.FirstName))
            {
                query = query.Where(x => x.j.FirstName.Contains(searchDto.FirstName));
            }

            if (searchDto.Position.HasValue)
            {
                // filter ด้วย id ตำแหน่ง
                query = query.Where(x => x.j.Position == searchDto.Position.Value);
            }

            // Search by Skills (JSON string contains)
            if (!string.IsNullOrWhiteSpace(searchDto.Status))
            {
                query = query.Where(x => x.s.Status.Contains(searchDto.Status));
            }

            // ---------- Select ออกเป็น DTO ----------
            var list = await query
                .Select(x => new InterviewResultDto
                {
                    ManageResumeId = x.j.ManageResumeId,
                    Title = x.titleName,
                    FirstName = x.j.FirstName,
                    LastName = x.j.LastName,
                    Email = x.j.Email,
                    Phone = x.j.Phone,
                    Gender = x.j.Gender,
                    Skills = x.j.Skills,
                    StartDate = x.s.StartDate,
                    ExpiredDate = x.s.ExpiredDate,
                    Status = x.s != null ? x.s.Status : null,
                    Experiences = x.j.Experiences,
                    Educations = x.j.Educations,
                    CreateDate = x.j.CreateDate,
                    CreateBy = x.j.CreateBy,
                    UpdateDate = x.j.UpdateDate,
                    UpdateBy = x.j.UpdateBy,

                    // FK + ชื่อที่ join มา
                    PositionId = x.j.Position,
                    LocationId = x.j.Location,
                    TitleId = x.j.Title,
                    PositionName = x.PositionName,
                    TitleName = x.titleName,
                    Position = x.PositionName,
                })
                .ToListAsync();

            var response = new ApiResponse<InterviewResultDto>
            {
                Data = list,
                TotalData = list.Count
            };

            return Ok(response);
        }

        public sealed class InterviewResultDto
        {
            public int? ManageResumeId { get; set; }
            public string? ResumeTitle { get; set; }

            public int? PositionId { get; set; }
            public int? LocationId { get; set; }
            public int? TitleId { get; set; }
            public int? JobTitleId { get; set; }
            public int? ScheduleId { get; set; }
            public int? DepartmentId { get; set; }
            public int? ClientId { get; set; }
            public int? InterviewResultId { get; set; }

            // ชื่อที่ได้จากตารางอ้างอิง (ไว้แสดงผล)
            public string? PositionName { get; set; }
            public string? LocationName { get; set; } 
            public string? TitleName { get; set; }
            public string? JobTitleName { get; set; }
            public string? DepartmentName { get; set; }
            public string? ClientName { get; set; }
            public DateTime? DateInternal { get; set; }
            public DateTime? DateExternal { get; set; }
            public string? StatusInternal { get; set; }
            public string? StatusExternal { get; set; }
            public string? Comment { get; set; }
            public string? Step { get; set; }

            // ฟิลด์เดิมอื่น ๆ ที่ต้องการส่งกลับ
            public string? Title { get; set; }
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? Email { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? ExpiredDate { get; set; }
            public string? JobTitle { get; set; }
            public string? Status { get; set; }
            public string? Phone { get; set; }
            public string? Gender { get; set; }
            public string? Position { get; set; }
            public string? Location { get; set; }
            public string? Skills { get; set; }
            public string? Experiences { get; set; }
            public string? Educations { get; set; }
            //public string? Status { get; set; }
            public DateTime? CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public DateTime? UpdateDate { get; set; }
            public string? UpdateBy { get; set; }

        }


        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            return username;
        }

    }
}

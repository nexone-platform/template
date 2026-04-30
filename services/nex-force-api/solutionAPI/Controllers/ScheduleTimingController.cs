using solutionAPI.Services;
using AutoMapper;
using Consul;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Elfie.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares.Models;
using System.Linq;
using System.Security.Claims;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ScheduleTimingController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;
        private readonly IMapper _mapper;
        public ScheduleTimingController(ApplicationDbContext context, IMapper mapper, EmailService emailService)
        {
            _mapper = mapper;
            _context = context;
            _emailService = emailService;
        }

        //[HttpGet("getAllManageResume")]
        //public async Task<ActionResult<IEnumerable<ManageResume>>> GetAllManageResume()
        //{
        //    var manageResume = await _context.ManageResume.ToListAsync();
        //    var response = new ApiResponse<ManageResume>
        //    {
        //        Data = manageResume,
        //        TotalData = manageResume.Count
        //    };
        //    return Ok(response);
        //}

        [HttpGet("getAllManageResume")]
        public async Task<ActionResult<ApiResponse<ScheduleTimingDto>>> GetAllManageResume()
        {
            // LEFT JOIN
            var query =
                from j in _context.ManageResume

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

                select new ScheduleTimingDto
                {
                    ManageResumeId = j.ManageResumeId,

                    // FK ids
                    PositionId = j.Position,
                    LocationId = j.Location,
                    TitleId    = j.Title,
                    JobTitleId = s.JobTitleId,

                    // Display names (ป้องกัน null)
                    PositionName = p.DesignationNameTh ?? p.DesignationNameEn,
                    LocationName = l.Company ,
                    TitleName    = t.TitleNameTh ?? t.TitleNameEn ?? t.TitleNameCode,
                    JobTitleName = mj.JobTitle,

                    // ฟิลด์อื่น ๆ (ป้องกัน null)
                    //Department = d.DepartmentNameTh,
                    //JobTypeName = e.EmployeeTypeNameEn,
                    // ถ้ามีคอลัมน์ชื่อ ResumeTitle ในตาราง j ให้ใช้ของ j เอง ไม่ใช่ชื่อประเภทพนักงาน
                    //ResumeTitle = j.ResumeTitle,  // ← ปรับให้ตรงกับ model ของคุณ
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

            var response = new ApiResponse<ScheduleTimingDto>
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
        public async Task<IActionResult> CreateOrUpdateScheduleTiming([FromBody] ScheduleTiming scheduleTiming)
        {
            if (scheduleTiming == null) return BadRequest(new { message = "Invalid Manage Resume data." });

            try
            {
                Console.WriteLine(">>> CreateOrUpdateScheduleTiming CALLED");
                if (scheduleTiming.ScheduleId > 0)
                {
                    var existing = await _context.ScheduleTiming
                        .FirstOrDefaultAsync(e => e.ManageResumeId == scheduleTiming.ManageResumeId);
                    if (existing == null) return NotFound(new { message = $"Schedule Timing with ID {scheduleTiming.ManageResumeId} not found." });

                    existing.UpdateBy = scheduleTiming.UpdateBy;
                    existing.UpdateDate = DateTime.UtcNow;
                    existing.ManageResumeId = scheduleTiming.ManageResumeId;
                    existing.JobTitleId = scheduleTiming.JobTitleId;
                    existing.StartDate = scheduleTiming.StartDate;
                    existing.ExpiredDate = scheduleTiming.ExpiredDate;
                    existing.Status = scheduleTiming.Status;

                    _context.ScheduleTiming.Update(existing);
                }
                else
                {
                    var maxId = await _context.ScheduleTiming
                                .MaxAsync(e => (int?)e.ScheduleId);
                    if (maxId == null)
                    {
                        // Handle the case where the table is empty
                        maxId = 1;
                    }
                    else
                    {
                        maxId = maxId + 1;
                    }

                    var newDocument = new ScheduleTiming
                    {
                        ScheduleId = (int)maxId,
                        ManageResumeId = scheduleTiming.ManageResumeId,
                        JobTitleId = scheduleTiming.JobTitleId,
                        StartDate = scheduleTiming.StartDate,
                        ExpiredDate = scheduleTiming.ExpiredDate,
                        Status = scheduleTiming.Status,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = scheduleTiming.CreateBy
                    };

                    _context.ScheduleTiming.Add(newDocument);
                }

                await _context.SaveChangesAsync();

                /* ================= SEND EMAIL ================= */
                try
                {
                    var resume = await _context.ManageResume
                        .AsNoTracking()
                        .FirstOrDefaultAsync(x => x.ManageResumeId == scheduleTiming.ManageResumeId);

                    var job = await _context.ManageJobs
                        .AsNoTracking()
                        .FirstOrDefaultAsync(j => j.ManageJobId == scheduleTiming.JobTitleId);

                    if (resume != null && !string.IsNullOrEmpty(resume.Email))
                    {
                        var values = new Dictionary<string, string>
                        {
                            { "FullName", $"{resume.FirstName} {resume.LastName}" },
                            { "StartDate", scheduleTiming.StartDate?.ToString("dd/MM/yyyy") ?? "-" },
                            { "EndDate", scheduleTiming.ExpiredDate?.ToString("dd/MM/yyyy") ?? "-" },
                            { "StartTime", scheduleTiming.StartDate?.ToString("HH:mm") ?? "-"},
                            { "EndTime", scheduleTiming.ExpiredDate?.ToString("HH:mm") ?? "-"},
                            { "Position", $"{job.JobTitle}"}
                        };

                        var languageCode = "en"; // ตามที่คุณต้องการ
                        var templateCode = "SCHEDULE_TIME";

                        var (subject, content) =
                            await _emailService.GetTemplateWithContentAsync(
                                templateCode,
                                values,
                                languageCode
                            );

                        if (!string.IsNullOrWhiteSpace(subject) &&
                            !string.IsNullOrWhiteSpace(content))
                        {
                            await _emailService.SendEmailBySettingAsync(
                                "yeonlicha.y@gmail.com",
                                //resume.Email,
                                subject,
                                content
                            );
                        }
                    }
                }
                catch (Exception ex)
                {
                    // ❗ ไม่ throw เพื่อไม่ให้ API fail
                    Console.WriteLine($"Email error: {ex.Message}");
                }
                /* ================================================= */

                return Ok(new { message = "Schedule Timing save successfully" });
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
        public async Task<IActionResult> DeleteScheduleTiming(int id)
        {
            // Find the holiday by its ID
            var scheduleTiming = await _context.ScheduleTiming.FindAsync(id);
            if (scheduleTiming == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "schedule Timing not found" });
            }

            // Remove the holiday from the database
            _context.ScheduleTiming.Remove(scheduleTiming);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "schedule Timing deleted successfully" });
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

        public class ScheduleTimingSearchDto
        {
            public string? FirstName { get; set; }
            public int? Position { get; set; }   // = PositionId
            public string? Status { get; set; }
        }

        [HttpPost("searchScheduleTime")]
        public async Task<ActionResult<ApiResponse<ScheduleTimingDto>>> SearchResume(
            [FromBody] ScheduleTimingSearchDto searchDto)
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
                .Select(x => new ScheduleTimingDto
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

            var response = new ApiResponse<ScheduleTimingDto>
            {
                Data = list,
                TotalData = list.Count
            };

            return Ok(response);
        }

        public sealed class ScheduleTimingDto
        {
            public int? ManageResumeId { get; set; }
            public string? ResumeTitle { get; set; }

            public int? PositionId { get; set; }
            public int? LocationId { get; set; }
            public int? TitleId { get; set; }
            public int? JobTitleId { get; set; }
            public int? ScheduleId { get; set; }

            // ชื่อที่ได้จากตารางอ้างอิง (ไว้แสดงผล)
            public string? PositionName { get; set; }
            public string? LocationName { get; set; } 
            public string? TitleName { get; set; }
            public string? JobTitleName { get; set; }

            // ฟิลด์เดิมอื่น ๆ ที่ต้องการส่งกลับ
            //public string? Department { get; set; } // ถ้ายังมี string เดิมอยู่
            //public string? JobTypeName { get; set; }
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

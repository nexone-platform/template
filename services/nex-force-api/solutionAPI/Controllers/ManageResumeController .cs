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
using static solutionAPI.Controllers.DesignationsController;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ManageResumeController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public ManageResumeController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
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
        public async Task<ActionResult<ApiResponse<ManageResumeDto>>> GetAllManageResume()
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

                select new ManageResumeDto
                {
                    ManageResumeId = j.ManageResumeId,

                    // FK ids
                    PositionId = j.Position,
                    LocationId = j.Location,
                    TitleId    = j.Title,

                    // Display names (ป้องกัน null)
                    PositionName = p.DesignationNameTh ?? p.DesignationNameEn,
                    LocationName = l.Company ?? l.Company,
                    TitleName    = t.TitleNameTh ?? t.TitleNameEn ?? t.TitleNameCode,

                    // ฟิลด์อื่น ๆ (ป้องกัน null)
                    //Department = d.DepartmentNameTh,
                    //JobTypeName = e.EmployeeTypeNameEn,
                    // ถ้ามีคอลัมน์ชื่อ ResumeTitle ในตาราง j ให้ใช้ของ j เอง ไม่ใช่ชื่อประเภทพนักงาน
                    //ResumeTitle = j.ResumeTitle,  // ← ปรับให้ตรงกับ model ของคุณ
                    Title = t.TitleNameEn,
                    FirstName = j.FirstName,
                    LastName = j.LastName,
                    Email = j.Email,
                    StartDate = s.StartDate,
                    ExpiredDate = s.ExpiredDate,
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

            var response = new ApiResponse<ManageResumeDto>
            {
                Data = list,
                TotalData = list.Count
            };

            return Ok(response);
        }

        //[HttpGet("getManageResumeById/{id}")]
        //public async Task<ActionResult<ManageResumeDto>> GetManageResumeById(int id)
        //{
        //    var resume = await _context.ManageResume.FindAsync(id);

        //    if (resume == null)
        //    {
        //        return NotFound(new { message = $"Resume witd ID {id} not found." });
        //    }

        //    var resumeDto = new ManageResumeDto
        //    {
        //        ManageResumeId = resume.ManageResumeId,
        //        Title = resume.Title,
        //        FirstName = resume.FirstName,
        //        LastName = resume.LastName,
        //        Phone = resume.Phone,
        //        Email = resume.Email,
        //        Gender = resume.Gender,
        //        Skills = resume.Skills,
        //        Experiences = resume.Experiences,
        //        Educations = resume.Educations,
        //        CreateBy = resume.CreateBy,
        //        CreateDate = resume.CreateDate
        //    };

        //    return Ok(resumeDto);
        //}


        //[HttpPost("update")]
        //public async Task<ActionResult<IEnumerable<ManageJobs>>> CreateOrUpdateManageJobs([FromBody] ManageJobs manageJobs)
        //{

        //    if (manageJobs == null)
        //    {
        //        return BadRequest(new { message = "Invalid Manage Jobs data." });
        //    }
        //    if (manageJobs.ManageJobId > 0 )
        //    {  // Update existing 
        //        var existingDocument = await _context.ManageJobs
        //            .FirstOrDefaultAsync(e => e.ManageJobId == manageJobs.ManageJobId);
        //        if (existingDocument == null)
        //        {
        //            return NotFound(new { message = $"Manage Jobs with ID {manageJobs.ManageJobId} not found." });
        //        }

        //        existingDocument.UpdateBy = GetCurrentUserId();
        //        existingDocument.UpdateDate = DateTime.UtcNow;
        //        existingDocument.JobTitle = manageJobs.JobTitle;
        //        existingDocument.Department = manageJobs.Department;
        //        existingDocument.JobLocation = manageJobs.JobLocation;
        //        existingDocument.EmploymentType = manageJobs.EmploymentType;
        //        existingDocument.Description = manageJobs.Description;
        //        existingDocument.Experience = manageJobs.Experience;
        //        existingDocument.SalaryFrom = manageJobs.SalaryFrom;
        //        existingDocument.SalaryTo = manageJobs.SalaryTo;
        //        existingDocument.StartDate = manageJobs.StartDate;
        //        existingDocument.ExpiredDate = manageJobs.ExpiredDate;
        //        existingDocument.Position = manageJobs.Position;
        //        existingDocument.Age = manageJobs.Age;
        //        existingDocument.Qualification = manageJobs.Qualification;
        //        existingDocument.CreateDate = existingDocument.CreateDate;
        //        existingDocument.CreateBy = existingDocument.CreateBy;

        //        _context.ManageJobs.Update(existingDocument);
        //    } else
        //    {
        //        //var maxId = await _context.ManageJobs
        //        //            .MaxAsync(e => (int?)e.ManageJobId);
        //        //if (maxId == null)
        //        //{
        //        //    // Handle the case where the table is empty
        //        //    maxId = 1;
        //        //}
        //        //else
        //        //{
        //        //    maxId = maxId + 1;
        //        //}

        //        var newDocument = new ManageJobs
        //        {
        //            //ManageJobId = (int)maxId,
        //            JobTitle = manageJobs.JobTitle,
        //            Department = manageJobs.Department,
        //            JobLocation = manageJobs.JobLocation,
        //            EmploymentType = manageJobs.EmploymentType,
        //            Description = manageJobs.Description,
        //            Experience = manageJobs.Experience,
        //            SalaryFrom = manageJobs.SalaryFrom,
        //            SalaryTo = manageJobs.SalaryTo,
        //            StartDate = manageJobs.StartDate,
        //            ExpiredDate = manageJobs.ExpiredDate,
        //            Position = manageJobs.Position,
        //            Age = manageJobs.Age,
        //            Qualification = manageJobs.Qualification,
        //            CreateDate = DateTime.UtcNow,
        //            CreateBy = GetCurrentUserId()
        //        };

        //        _context.ManageJobs.Add(newDocument);
        //    }
        //    await _context.SaveChangesAsync();

        //    return Ok(new { message = "Manage Jobs save successfully" });
        //}

        [HttpGet("getManageResumeById/{id:int}")]
        public async Task<ActionResult<ManageResumeDto>> GetManageResumeById(int id)
        {
            // ถ้า j.Position / j.Location เป็น int? ให้ cast ด้านขวาเป็น int? ให้ตรงชนิด
            var dto = await (
                from j in _context.ManageResume
                where j.ManageResumeId == id

                // Position (Designation)
                join d0 in _context.Designations
                    on j.Position equals d0.DesignationId into dgrp
                from d in dgrp.DefaultIfEmpty()

                    // Location (Client)
                join c0 in _context.Clients
                    on j.Location equals c0.ClientId into cgrp
                from c in cgrp.DefaultIfEmpty()

                join t0 in _context.Title
                    on j.Title equals t0.TitleID into tte
                from t in tte.DefaultIfEmpty()

                select new ManageResumeDto
                {
                    ManageResumeId = j.ManageResumeId,

                    // FK + display
                    PositionId = j.Position,
                    PositionName = d.DesignationNameTh ?? d.DesignationNameEn ?? d.DesignationCode,
                    LocationId = j.Location,
                    LocationName = c.ClientCode ?? c.Company ,
                    TitleId = j.Title,
                    TitleName = t.TitleNameEn ?? t.TitleNameTh ?? t.TitleNameCode,

                    // fields
                    Title = t.TitleNameEn,
                    FirstName = j.FirstName,
                    LastName = j.LastName,
                    Phone = j.Phone,
                    Email = j.Email,
                    Gender = j.Gender,
                    Position = d.DesignationNameEn,
                    Location = c.Company,
                    Skills = j.Skills,
                    Experiences = j.Experiences,
                    Educations = j.Educations,
                    CreateBy = j.CreateBy,
                    CreateDate = j.CreateDate,
                    UpdateBy = j.UpdateBy,
                    UpdateDate = j.UpdateDate
                }
            ).FirstOrDefaultAsync();

            if (dto == null)
                return NotFound(new { message = $"Resume with ID {id} not found." });

            return Ok(dto);
        }


        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdateManageResume([FromBody] ManageResume manageResume)
        {
            if (manageResume == null) return BadRequest(new { message = "Invalid Manage Resume data." });

            try
            {
                if (manageResume.ManageResumeId > 0)
                {
                    var existing = await _context.ManageResume
                        .FirstOrDefaultAsync(e => e.ManageResumeId == manageResume.ManageResumeId);
                    if (existing == null) return NotFound(new { message = $"Manage Jobs with ID {manageResume.ManageResumeId} not found." });

                    existing.UpdateBy = manageResume.UpdateBy;
                    existing.UpdateDate = DateTime.UtcNow;
                    existing.Title = manageResume.Title;
                    existing.FirstName = manageResume.FirstName;
                    existing.LastName = manageResume.LastName;
                    existing.Phone = manageResume.Phone;
                    existing.Gender = manageResume.Gender;
                    existing.Position = manageResume.Position;
                    existing.Location = manageResume.Location;
                    existing.Skills = manageResume.Skills;
                    existing.Email = manageResume.Email;
                    existing.Experiences = manageResume.Experiences;
                    existing.Educations = manageResume.Educations;

                    _context.ManageResume.Update(existing);
                }
                else
                {
                    var maxId = await _context.ManageResume
                                .MaxAsync(e => (int?)e.ManageResumeId);
                    if (maxId == null)
                    {
                        // Handle the case where the table is empty
                        maxId = 1;
                    }
                    else
                    {
                        maxId = maxId + 1;
                    }

                    var newDocument = new ManageResume
                    {
                        ManageResumeId = (int)maxId,
                        Title = manageResume.Title,
                        FirstName = manageResume.FirstName,
                        LastName = manageResume.LastName,
                        Email = manageResume.Email,
                        Phone = manageResume.Phone,
                        Gender = manageResume.Gender,
                        Position = manageResume.Position,
                        Location = manageResume.Location,
                        Skills = manageResume.Skills,
                        Experiences = manageResume.Experiences,
                        Educations = manageResume.Educations,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = manageResume.CreateBy
                    };

                    _context.ManageResume.Add(newDocument);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Manage Resume save successfully" });
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
        public async Task<IActionResult> DeleteManageResume(int id)
        {
            // Find the holiday by its ID
            var manageResume = await _context.ManageResume.FindAsync(id);
            if (manageResume == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "Manage Resume not found" });
            }

            // Remove the holiday from the database
            _context.ManageResume.Remove(manageResume);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "Manage Resume deleted successfully" });
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

        public class manageResumeSearchDto
        {
            public string? FirstName { get; set; }
            public int? Position { get; set; }   // = PositionId
            public int? Location { get; set; }   // = LocationId
            public string? Phone { get; set; }
            public string? Skills { get; set; }
        }

        [HttpPost("searchResume")]
        public async Task<ActionResult<ApiResponse<ManageResumeDto>>> SearchResume(
            [FromBody] manageResumeSearchDto searchDto)
        {
            // Base query + LEFT JOIN
            var query =
                from j in _context.ManageResume.AsNoTracking()

                    // Location
                join c0 in _context.Clients.AsNoTracking()
                    on j.Location equals c0.ClientId into cgrp
                from c in cgrp.DefaultIfEmpty()

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
                    JobLocationName = c.Company,
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

            if (searchDto.Location.HasValue)
            {
                // filter ด้วย id สถานที่ทำงาน
                query = query.Where(x => x.j.Location == searchDto.Location.Value);
            }

            if (!string.IsNullOrWhiteSpace(searchDto.Phone))
            {
                query = query.Where(x => x.j.Phone.Contains(searchDto.Phone));
            }

            // Search by Skills (JSON string contains)
            if (!string.IsNullOrWhiteSpace(searchDto.Skills))
            {
                string keyword = searchDto.Skills.Trim().ToLower();

                query = query.Where(x =>
                    x.j.Skills.ToLower().Contains(keyword)
                );
            }

            // ---------- Select ออกเป็น DTO ----------
            var list = await query
                .Select(x => new ManageResumeDto
                {
                    ManageResumeId = x.j.ManageResumeId,
                    Title = x.titleName,
                    FirstName = x.j.FirstName,
                    LastName = x.j.LastName,
                    Email = x.j.Email,
                    Phone = x.j.Phone,
                    Gender = x.j.Gender,
                    Skills = x.j.Skills,
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
                    LocationName = x.JobLocationName,
                    TitleName = x.titleName,
                    Position = x.PositionName,
                    Location = x.JobLocationName
                })
                .ToListAsync();

            var response = new ApiResponse<ManageResumeDto>
            {
                Data = list,
                TotalData = list.Count
            };

            return Ok(response);
        }


        public sealed class ManageResumeDto
        {
            public int? ManageResumeId { get; set; }
            public string? ResumeTitle { get; set; }

            public int? PositionId { get; set; }
            public int? LocationId { get; set; }
            public int? TitleId { get; set; }

            // ชื่อที่ได้จากตารางอ้างอิง (ไว้แสดงผล)
            public string? PositionName { get; set; }
            public string? LocationName { get; set; } 
            public string? TitleName { get; set; }

            // ฟิลด์เดิมอื่น ๆ ที่ต้องการส่งกลับ
            //public string? Department { get; set; } // ถ้ายังมี string เดิมอยู่
            //public string? JobTypeName { get; set; }
            public string? Title { get; set; }
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? Email { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? ExpiredDate { get; set; }
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

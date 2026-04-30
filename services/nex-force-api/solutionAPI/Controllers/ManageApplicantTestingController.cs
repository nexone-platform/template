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
using static solutionAPI.Controllers.ManageResumeController;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ManageApplicantTestingController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public ManageApplicantTestingController(ApplicationDbContext context, IMapper mapper)
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
        public async Task<ActionResult<ApiResponse<ManageApplicantTestingDto>>> GetAllManageResume()
        {
            // 1) ดึง Resume + ApplicantTesting (ไม่ join category ผ่าน CategoryId แล้ว)
            var rows = await (
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

                join s0 in _context.ManageApplicantTesting
                    on j.ManageResumeId equals s0.ManageResumeId into scdt
                from s in scdt.DefaultIfEmpty()

                select new ManageApplicantTestingDto
                {
                    ManageResumeId = j.ManageResumeId,

                    PositionId = j.Position,
                    LocationId = j.Location,
                    TitleId = j.Title,

                    ManageApplicantTestingId = s != null ? s.ManageApplicantTestingId : 0,

                    // ✅ ส่ง CategoriesJson ที่เก็บจริงจาก DB ออกไป
                    CategoriesJson = s != null ? s.CategoriesJson : null,

                    Status = s != null ? s.Status : null,

                    PositionName = p != null ? (p.DesignationNameTh ?? p.DesignationNameEn) : null,
                    LocationName = l != null ? (l.Company ?? l.Company) : null,
                    TitleName = t != null ? (t.TitleNameTh ?? t.TitleNameEn ?? t.TitleNameCode) : null,

                    Title = t != null ? t.TitleNameEn : null,
                    FirstName = j.FirstName,
                    LastName = j.LastName,
                    Email = j.Email,
                    Experiences = j.Experiences,
                    Educations = j.Educations,
                    CreateDate = j.CreateDate,
                    CreateBy = j.CreateBy,
                    UpdateDate = j.UpdateDate,
                    UpdateBy = j.UpdateBy,
                    Phone = j.Phone,
                    Position = p != null ? p.DesignationNameEn : null,
                    Location = l != null ? l.Company : null,
                    Skills = j.Skills,
                    Gender = j.Gender,
                    StartCreateResume = j.CreateDate
                }
            ).ToListAsync();

            // กันซ้ำแบบเดิม (ถ้าจำเป็น)
            var list = rows
                .GroupBy(x => x.ManageResumeId)
                .Select(g => g.First())
                .ToList();

            // 2) parse categoriesJson -> รวม id ทั้งหมด เพื่อไปดึง category table
            static List<int> ParseIds(string? json)
            {
                if (string.IsNullOrWhiteSpace(json)) return new List<int>();
                try
                {
                    return System.Text.Json.JsonSerializer.Deserialize<List<int>>(json) ?? new List<int>();
                }
                catch
                {
                    return new List<int>();
                }
            }

            var allIds = list
                .SelectMany(x => ParseIds(x.CategoriesJson))
                .Distinct()
                .ToList();

            // 3) query category ทั้งหมดที่เกี่ยวข้องมาเก็บเป็น dictionary
            var catMap = await _context.Category
                .Where(c => c.CategoryId.HasValue && allIds.Contains(c.CategoryId.Value))
                .Select(c => new { c.CategoryId, c.CategoryDescription })
                .ToDictionaryAsync(x => x.CategoryId, x => x.CategoryDescription);

            // 4) เติม CategoryName ให้แต่ละ row (รวมหลายชื่อเป็น string)
            foreach (var item in list)
            {
                var ids = ParseIds(item.CategoriesJson);
                var names = ids
                    .Where(id => catMap.ContainsKey(id))
                    .Select(id => catMap[id])
                    .ToList();

                // ฟิลด์เดิม CategoryName (string) -> ใส่เป็นชื่อรวม
                item.CategoryName = names.Count > 0 ? string.Join(", ", names) : null;

                // ถ้าคุณยังอยากมี CategoryId เดี่ยวไว้โชว์/legacy:
                item.CategoryId = ids.Count > 0 ? ids[0] : (int?)null;
            }

            var response = new ApiResponse<ManageApplicantTestingDto>
            {
                Data = list,
                TotalData = list.Count
            };

            return Ok(response);
        }


        //[HttpGet("getAllManageResume")]
        //public async Task<ActionResult<ApiResponse<ManageApplicantTestingDto>>> GetAllManageResume()
        //{
        //    // LEFT JOIN
        //    var query =
        //        from j in _context.ManageResume

        //        join p0 in _context.Designations
        //            on j.Position equals p0.DesignationId into pst
        //        from p in pst.DefaultIfEmpty()

        //        join l0 in _context.Clients
        //            on j.Location equals l0.ClientId into lct
        //        from l in lct.DefaultIfEmpty()

        //        join t0 in _context.Title
        //            on j.Title equals t0.TitleID into tte
        //        from t in tte.DefaultIfEmpty()

        //        join s0 in _context.ManageApplicantTesting
        //            on j.ManageResumeId equals s0.ManageResumeId into scdt
        //        from s in scdt.DefaultIfEmpty()

        //        join c0 in _context.Category
        //            on s.CategoryId equals c0.CategoryId into ctgr   // ← ปรับชื่อ field ให้ตรง Entity จริง
        //        from ct in ctgr.DefaultIfEmpty()

        //        select new ManageApplicantTestingDto
        //        {
        //            ManageResumeId = j.ManageResumeId,

        //            // FK ids
        //            PositionId = j.Position,
        //            LocationId = j.Location,
        //            TitleId    = j.Title,
        //            CategoryId = ct.CategoryId,
        //            ManageApplicantTestingId = s.ManageApplicantTestingId,

        //            // Display names (ป้องกัน null)
        //            PositionName = p.DesignationNameTh ?? p.DesignationNameEn,
        //            LocationName = l.ClientNameEn ?? l.ClientNameTh,
        //            TitleName    = t.TitleNameTh ?? t.TitleNameEn ?? t.TitleNameCode,
        //            CategoryName = ct.CategoryDescription,
        //            CategoriesJson = ct.CategoryDescription,

        //            // ฟิลด์อื่น ๆ (ป้องกัน null)
        //            Title = t.TitleNameEn,
        //            FirstName = j.FirstName,
        //            LastName = j.LastName,
        //            Email = j.Email,
        //            Status = s.Status,
        //            Experiences = j.Experiences,
        //            Educations = j.Educations,
        //            CreateDate = j.CreateDate,
        //            CreateBy = j.CreateBy,
        //            UpdateDate = j.UpdateDate,
        //            UpdateBy = j.UpdateBy,
        //            Phone = j.Phone,
        //            Position = p.DesignationNameEn,
        //            Location = l.ClientNameEn,
        //            Skills = j.Skills,
        //            Gender = j.Gender,
        //            StartCreateResume = j.CreateDate
        //        };

        //    // ถ้าไม่ต้องการกันแถวซ้ำ สามารถใช้ GroupBy เหมือนเดิม
        //    var list = await query
        //        .GroupBy(x => x.ManageResumeId)
        //        .Select(g => g.First())
        //        .ToListAsync();

        //    var response = new ApiResponse<ManageApplicantTestingDto>
        //    {
        //        Data = list,
        //        TotalData = list.Count
        //    };

        //    return Ok(response);
        //}


        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdateScheduleTiming([FromBody] ManageApplicantTesting manageApplicantTesting)
        {
            if (manageApplicantTesting == null) return BadRequest(new { message = "Invalid Manage Resume data." });

            try
            {
                if (manageApplicantTesting.ManageApplicantTestingId > 0)
                {
                    var existing = await _context.ManageApplicantTesting
                        .FirstOrDefaultAsync(e => e.ManageResumeId == manageApplicantTesting.ManageResumeId);
                    if (existing == null) return NotFound(new { message = $"Schedule Timing with ID {manageApplicantTesting.ManageResumeId} not found." });

                    existing.UpdateBy = manageApplicantTesting.UpdateBy;
                    existing.UpdateDate = DateTime.UtcNow;
                    existing.ManageResumeId = manageApplicantTesting.ManageResumeId;
                    existing.CategoryId = manageApplicantTesting.CategoryId;
                    existing.CategoriesJson = manageApplicantTesting.CategoriesJson;
                    existing.Status = manageApplicantTesting.Status;

                    _context.ManageApplicantTesting.Update(existing);
                }
                else
                {
                    var maxId = await _context.ManageApplicantTesting
                                .MaxAsync(e => (int?)e.ManageApplicantTestingId);
                    if (maxId == null)
                    {
                        // Handle the case where the table is empty
                        maxId = 1;
                    }
                    else
                    {
                        maxId = maxId + 1;
                    }

                    var newDocument = new ManageApplicantTesting
                    {
                        ManageApplicantTestingId = (int)maxId,
                        ManageResumeId = manageApplicantTesting.ManageResumeId,
                        CategoryId = manageApplicantTesting.CategoryId,
                        CategoriesJson = manageApplicantTesting.CategoriesJson,
                        Status = manageApplicantTesting.Status,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = manageApplicantTesting.CreateBy
                    };

                    _context.ManageApplicantTesting.Add(newDocument);
                }

                await _context.SaveChangesAsync();
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

        public class ManageApplicantTestingSearchDto
        {
            public string? FirstName { get; set; }
            public int? Position { get; set; }   // = PositionId
            public string? Status { get; set; }
        }

        [HttpPost("searchScheduleTime")]
        public async Task<ActionResult<ApiResponse<ManageApplicantTestingDto>>> SearchResume(
            [FromBody] ManageApplicantTestingSearchDto searchDto)
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
                .Select(x => new ManageApplicantTestingDto
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

            var response = new ApiResponse<ManageApplicantTestingDto>
            {
                Data = list,
                TotalData = list.Count
            };

            return Ok(response);
        }

        public sealed class ManageApplicantTestingDto
        {
            public int? ManageResumeId { get; set; }
            public string? ResumeTitle { get; set; }

            public int? PositionId { get; set; }
            public int? LocationId { get; set; }
            public int? TitleId { get; set; }
            public int? JobTitleId { get; set; }
            public int? ScheduleId { get; set; }
            public int? CategoryId { get; set; }
            public string? CategoriesJson { get; set; }
            public int? ManageApplicantTestingId { get; set; }

            // ชื่อที่ได้จากตารางอ้างอิง (ไว้แสดงผล)
            public string? PositionName { get; set; }
            public string? LocationName { get; set; } 
            public string? TitleName { get; set; }
            public string? JobTitleName { get; set; }
            public string? CategoryName { get; set; }

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
            public DateTime? StartCreateResume { get; set; }
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

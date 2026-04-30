using AutoMapper;
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
    public class ManageJobsController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public ManageJobsController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }

        //[HttpGet("getAllManageJobs")]
        //public async Task<ActionResult<IEnumerable<ManageJobs>>> GetAllManageJobs()
        //{
        //    var manageJobs = await _context.ManageJobs.ToListAsync();
        //    var response = new ApiResponse<ManageJobs>
        //    {
        //        Data = manageJobs,
        //        TotalData = manageJobs.Count
        //    };
        //    return Ok(response);
        //}

        [HttpGet("getAllManageJobs")]
        public async Task<ActionResult<ApiResponse<ManageJobDto>>> GetAllManageJobs()
        {
            // JOIN แบบ LEFT JOIN ทั้งหมด (DefaultIfEmpty)
            var query =
                from j in _context.ManageJobs

                    // Department
                join d0 in _context.Departments
                    on j.Department equals d0.DepartmentId into dgrp
                from d in dgrp.DefaultIfEmpty()

                    // Client (JobLocation)
                join c0 in _context.Clients
                    on j.JobLocation equals c0.ClientId into cgrp
                from c in cgrp.DefaultIfEmpty()

                    // Employee Type
                join e0 in _context.EmployeeTypes
                    on j.EmploymentType equals e0.EmployeeTypeId into egrp
                from e in egrp.DefaultIfEmpty()

                    // Designation (Position)
                join p0 in _context.Designations
                    on j.Position equals p0.DesignationId into pgrp
                from p in pgrp.DefaultIfEmpty()

                select new ManageJobDto
                {
                    ManageJobId = j.ManageJobId,
                    JobTitle = j.JobTitle,

                    // id (FK)
                    DepartmentId = j.Department,
                    JobLocationId = j.JobLocation,
                    EmployeeTypeId = j.EmploymentType,
                    PositionId = j.Position,

                    // names (เลือก field ที่อยากแสดง)
                    DepartmentName = d.DepartmentNameTh ?? d.DepartmentNameEn ?? d.DepartmentCode,
                    JobLocationName = c.ClientCode ?? c.Company ?? c.Company,
                    EmployeeTypeName = e.EmployeeTypeNameEn ?? e.EmployeeTypeCode,
                    PositionName = p.DesignationNameEn ?? p.DesignationCode,

                    // ฟิลด์เดิมอื่น ๆ ที่ต้องการส่งกลับ
                    Department = d.DepartmentNameTh,
                    JobLocation = c.Company,
                    EmploymentType = e.EmployeeTypeNameEn,
                    Description = j.Description,
                    Experience = j.Experience,
                    SalaryFrom = j.SalaryFrom,
                    SalaryTo = j.SalaryTo,
                    StartDate = j.StartDate,
                    ExpiredDate = j.ExpiredDate,
                    Position = p.DesignationNameEn,
                    Age = j.Age,
                    Qualification = j.Qualification,
                    CreateDate = j.CreateDate,
                    CreateBy = j.CreateBy,
                    UpdateDate = j.UpdateDate,
                    UpdateBy = j.UpdateBy,
                    Status = j.Status
                };

            // เอาเฉพาะแถวแรกของแต่ละ ManageJobId (กันการคูณแถวจาก lookup ซ้ำ)
            var list = await query
                .GroupBy(x => x.ManageJobId)
                .Select(g => g.First())
                .ToListAsync();

            //var list = await query.ToListAsync();

            var response = new ApiResponse<ManageJobDto>
            {
                Data = list,
                TotalData = list.Count
            };

            return Ok(response);
        }


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

        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdateManageJobs([FromBody] ManageJobs manageJobs)
        {
            if (manageJobs == null) return BadRequest(new { message = "Invalid Manage Jobs data." });

            // ====== Date validations (ก่อนบันทึก/อัปเดต) ======
            // ปรับให้เหลือแค่ส่วนวันที่ (ตัดเวลา) เพื่อกัน timezone/เวลาทำให้เปรียบเทียบเพี้ยน
            DateTime? start = manageJobs.StartDate?.Date;
            DateTime? end = manageJobs.ExpiredDate?.Date;

            if (start == null || end == null)
            {
                return BadRequest(new
                {
                    message = "StartDate and ExpiredDate are required.",
                    errors = new
                    {
                        StartDate = start == null ? new[] { "StartDate is required." } : Array.Empty<string>(),
                        ExpiredDate = end == null ? new[] { "ExpiredDate is required." } : Array.Empty<string>()
                    }
                });
            }

            // ไม่อนุญาตให้ StartDate > ExpiredDate (ถ้าต้องการไม่ให้เท่ากัน ให้เปลี่ยนเป็น >=)
            if (start > end)
            {
                return BadRequest(new
                {
                    message = "StartDate cannot be later than ExpiredDate.",
                    errors = new
                    {
                        StartDate = new[] { "StartDate must be earlier than or equal to ExpiredDate." },
                        ExpiredDate = new[] { "ExpiredDate must be later than or equal to StartDate." }
                    }
                });
            }

            try
            {
                if (manageJobs.ManageJobId > 0)
                {
                    var existing = await _context.ManageJobs
                        .FirstOrDefaultAsync(e => e.ManageJobId == manageJobs.ManageJobId);
                    if (existing == null) return NotFound(new { message = $"Manage Jobs with ID {manageJobs.ManageJobId} not found." });

                    existing.UpdateBy = GetCurrentUserId();
                    existing.UpdateDate = DateTime.UtcNow;
                    existing.JobTitle = manageJobs.JobTitle;
                    existing.Department = manageJobs.Department;
                    existing.JobLocation = manageJobs.JobLocation;
                    existing.EmploymentType = manageJobs.EmploymentType;
                    existing.Description = manageJobs.Description;
                    existing.Experience = manageJobs.Experience;
                    existing.SalaryFrom = manageJobs.SalaryFrom;
                    existing.SalaryTo = manageJobs.SalaryTo;
                    existing.StartDate = manageJobs.StartDate;
                    existing.ExpiredDate = manageJobs.ExpiredDate;
                    existing.Position = manageJobs.Position;
                    existing.Age = manageJobs.Age;
                    existing.Qualification = manageJobs.Qualification;
                    existing.Status = manageJobs.Status;

                    _context.ManageJobs.Update(existing);
                }
                else
                {
                    var maxId = await _context.ManageJobs
                                .MaxAsync(e => (int?)e.ManageJobId);
                    if (maxId == null)
                    {
                        // Handle the case where the table is empty
                        maxId = 1;
                    }
                    else
                    {
                        maxId = maxId + 1;
                    }

                    var newDocument = new ManageJobs
                    {
                        ManageJobId = (int)maxId,
                        JobTitle = manageJobs.JobTitle,
                        Department = manageJobs.Department,
                        JobLocation = manageJobs.JobLocation,
                        EmploymentType = manageJobs.EmploymentType,
                        Description = manageJobs.Description,
                        Experience = manageJobs.Experience,
                        SalaryFrom = manageJobs.SalaryFrom,
                        SalaryTo = manageJobs.SalaryTo,
                        StartDate = manageJobs.StartDate,
                        ExpiredDate = manageJobs.ExpiredDate,
                        Position = manageJobs.Position,
                        Age = manageJobs.Age,
                        Qualification = manageJobs.Qualification,
                        Status = manageJobs.Status,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = GetCurrentUserId()
                    };

                    _context.ManageJobs.Add(newDocument);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Manage Jobs save successfully" });
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
        public async Task<IActionResult> DeleteManageJobs(int id)
        {
            // Find the holiday by its ID
            var manageJobs = await _context.ManageJobs.FindAsync(id);
            if (manageJobs == null)
            {
                // If not found, return 404 Not Found
                return NotFound(new { message = "Document Running not found" });
            }

            // Remove the holiday from the database
            _context.ManageJobs.Remove(manageJobs);

            // Save the changes asynchronously
            await _context.SaveChangesAsync();

            // Return a success response
            return Ok(new { message = "Manage Jobs deleted successfully" });
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

        public class manageJobSearchDto
        {
            public string? JobTitle { get; set; }
            public int? Department { get; set; }
            public int? EmploymentType { get; set; }
            public string? Status { get; set; }
        }

        //[HttpPost("searchManageJob")]
        //public async Task<ActionResult<IEnumerable<ManageJobs>>> SearchClients([FromBody] manageJobSearchDto searchDto)
        //{
        //    var query =_context.ManageJobs.AsQueryable();

        //    // Apply filters based on the search criteria
        //    if (!string.IsNullOrEmpty(searchDto.JobTitle))
        //    {
        //        query = query.Where(m => m.JobTitle.Contains(searchDto.JobTitle));
        //    }

        //    if (searchDto.Department.HasValue)
        //    {
        //        query = query.Where(c => c.Department == searchDto.Department);
        //    }

        //    if (searchDto.EmploymentType.HasValue)
        //    {
        //        query = query.Where(c => c.EmploymentType == searchDto.EmploymentType);
        //    }

        //    if (!string.IsNullOrEmpty(searchDto.Status))
        //    {
        //        query = query.Where(m => m.Status == searchDto.Status);
        //    }

        //    var manageJob = await query.Select(m => new ManageJobs
        //    {
        //        ManageJobId = m.ManageJobId,
        //        JobTitle = m.JobTitle,
        //        Department = m.Department,
        //        JobLocation = m.JobLocation,
        //        EmploymentType = m.EmploymentType,
        //        Position = m.Position,
        //        StartDate = m.StartDate,
        //        ExpiredDate = m.ExpiredDate,
        //        Experience = m.Experience,
        //        Age = m.Age,
        //        SalaryFrom = m.SalaryFrom,
        //        SalaryTo = m.SalaryTo,
        //        Qualification = m.Qualification,
        //        Description = m.Description,
        //        Status = m.Status,
        //        CreateDate = m.CreateDate,
        //        CreateBy = m.CreateBy,
        //        UpdateDate = m.UpdateDate,
        //        UpdateBy = m.UpdateBy
        //    }).ToListAsync();

        //    return Ok(manageJob);
        //}

        public class ManageJobSearchDto
        {
            public string? JobTitle { get; set; }
            public int? Department { get; set; }       // FK id
            public int? EmploymentType { get; set; }   // FK id
            public int? JobLocation { get; set; }
            public string? Status { get; set; }        // 'Open' | 'Closed' | 'Cancelled' ...
        }

        [HttpPost("searchManageJob")]
        public async Task<ActionResult<IEnumerable<ManageJobDto>>> SearchManageJob([FromBody] ManageJobSearchDto searchDto)
        {
            // เริ่มจากตารางหลัก
            var query =
                from j in _context.ManageJobs.AsNoTracking()

                    // Department (LEFT JOIN)
                join d0 in _context.Departments.AsNoTracking()
                    on j.Department equals d0.DepartmentId into dgrp
                from d in dgrp.DefaultIfEmpty()

                    // Client / JobLocation (LEFT JOIN)
                join c0 in _context.Clients.AsNoTracking()
                    on j.JobLocation equals c0.ClientId into cgrp
                from c in cgrp.DefaultIfEmpty()

                    // Employee Type (LEFT JOIN)
                join e0 in _context.EmployeeTypes.AsNoTracking()
                    on j.EmploymentType equals e0.EmployeeTypeId into egrp
                from e in egrp.DefaultIfEmpty()

                    // Designation / Position (LEFT JOIN)
                join p0 in _context.Designations.AsNoTracking()
                    on j.Position equals p0.DesignationId into pgrp
                from p in pgrp.DefaultIfEmpty()

                    // โปรเจกต์เป็น DTO เดียวก่อน แล้วค่อย Filter ต่อได้ (EF รองรับ)
                select new
                {
                    j,
                    DepartmentName = /* แก้ให้ตรง field จริงของคุณ */ d.DepartmentNameTh,       // ex: d.DepartmentNameTh ?? d.DepartmentNameEn ?? d.DepartmentCode
                    JobLocationName = /* field จริง */ c.Company,                              // ex: c.ClientNameEn ?? c.ClientCode
                    EmployeeTypeName = /* field จริง */ e.EmployeeTypeNameEn,                        // ex: e.EmployeeTypeNameEn ?? e.EmployeeTypeCode
                    PositionName = /* field จริง */ p.DesignationNameEn                          // ex: p.DesignationNameEn ?? p.DesignationCode
                };

            // ----- APPLY FILTERS -----
            if (!string.IsNullOrWhiteSpace(searchDto.JobTitle))
            {
                var kw = searchDto.JobTitle.Trim();
                query = query.Where(x => x.j.JobTitle.Contains(kw));
            }
            if (searchDto.Department.HasValue)
            {
                query = query.Where(x => x.j.Department == searchDto.Department);
            }
            if (searchDto.EmploymentType.HasValue)
            {
                query = query.Where(x => x.j.EmploymentType == searchDto.EmploymentType);
            }
            if (searchDto.JobLocation.HasValue)
            {
                query = query.Where(x => x.j.JobLocation == searchDto.JobLocation);
            }
            if (!string.IsNullOrWhiteSpace(searchDto.Status))
            {
                var st = searchDto.Status.Trim();
                query = query.Where(x => x.j.Status == st);
            }

            // ป้องกันกรณี lookup ซ้ำจนคูณแถว (ถ้า data ฝั่ง lookup มี duplicate)
            // ถ้าแน่ใจว่า FK -> PK เป็น unique จริง ๆ สามารถตัด GroupBy ออกได้
            var list = await query
                .GroupBy(x => x.j.ManageJobId)     // กันซ้ำ
                .Select(g => g.Select(x => new ManageJobDto
                {
                    ManageJobId = x.j.ManageJobId,
                    JobTitle = x.j.JobTitle,

                    DepartmentId = x.j.Department,
                    JobLocationId = x.j.JobLocation,
                    EmployeeTypeId = x.j.EmploymentType,
                    PositionId = x.j.Position,

                    DepartmentName = x.DepartmentName,
                    JobLocationName = x.JobLocationName,
                    EmployeeTypeName = x.EmployeeTypeName,
                    PositionName = x.PositionName,

                    Department = x.DepartmentName,
                    JobLocation = x.JobLocationName,
                    EmploymentType = x.EmployeeTypeName,
                    StartDate = x.j.StartDate,
                    ExpiredDate = x.j.ExpiredDate,
                    Experience = x.j.Experience,
                    Age = x.j.Age,
                    SalaryFrom = x.j.SalaryFrom,
                    SalaryTo = x.j.SalaryTo,
                    Qualification = x.j.Qualification,
                    Description = x.j.Description,
                    Status = x.j.Status,
                    CreateDate = x.j.CreateDate,
                    CreateBy = x.j.CreateBy,
                    UpdateDate = x.j.UpdateDate,
                    UpdateBy = x.j.UpdateBy
                }).First())
                .ToListAsync();

            return Ok(list);
        }


        public sealed class ManageJobDto
        {
            public int? ManageJobId { get; set; }
            public string? JobTitle { get; set; }

            // เก็บเป็น id (int) ที่ผูก FK
            public int? DepartmentId { get; set; }
            public int? JobLocationId { get; set; }    // client
            public int? EmployeeTypeId { get; set; }
            public int? PositionId { get; set; }       // designation

            // ชื่อที่ได้จากตารางอ้างอิง (ไว้แสดงผล)
            public string? DepartmentName { get; set; }
            public string? JobLocationName { get; set; }
            public string? EmployeeTypeName { get; set; }
            public string? PositionName { get; set; }

            // ฟิลด์เดิมอื่น ๆ ที่ต้องการส่งกลับ
            public string? Department { get; set; } // ถ้ายังมี string เดิมอยู่
            public string? JobLocation { get; set; }
            public string? EmploymentType { get; set; }
            public string? Description { get; set; }
            public string? Experience { get; set; }
            public decimal? SalaryFrom { get; set; }
            public decimal? SalaryTo { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? ExpiredDate { get; set; }
            public string? Position { get; set; }
            public string? Age { get; set; }
            public string? Qualification { get; set; }
            public DateTime? CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public DateTime? UpdateDate { get; set; }
            public string? UpdateBy { get; set; }
            public string? Status { get; set; }
        }


        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            return username;
        }

    }
}

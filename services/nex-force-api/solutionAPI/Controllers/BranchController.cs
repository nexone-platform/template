using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;

using static solutionAPI.Controllers.OrganizationController;

namespace solutionAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class BranchController : ControllerBase
    {

        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILoggingService _loggingService;
        public BranchController(ApplicationDbContext context, IMapper mapper, ILoggingService loggingService)
        {
            _mapper = mapper;
            _context = context;
            _loggingService = loggingService;
        }
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        [HttpGet("company")]
        public async Task<ActionResult<ApiResponse<Organization>>> GetCompany()
        {
            var data = await _context.Organizations.ToListAsync();

            if (data == null || data.Count == 0)
            {
                return NotFound(new { message = "No Branch found." });
            }


            // Prepare the response
            var response = new ApiResponse<Organization>
            {
                Data = data,
                TotalData = data.Count
            };

            return Ok(response);
        }

        public class OrganizationData
        {
            public int? OrganizationId { get; set; }
            public string? OrganizationNameTh { get; set; }
            public string? OrganizationNameEn { get; set; }
            public string? OrganizationCode { get; set; }
            public string? Email { get; set; }
            public string? Phone { get; set; }
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<Branch>>> GetCompanyBranch()
        {
            var data = await _context.Branchs.Include(b => b.Organization).ToListAsync();

            if (data == null || data.Count == 0)
            {
                return NotFound(new { message = "No Branch found." });
            }

            // Map the data data to a DTO (if needed)
            var dataDTO = data.Select(o => new Branch
            {
                BranchId = o.BranchId,
                BranchNameEn = o.BranchNameEn,
                BranchNameTh = o.BranchNameTh,
                BranchCode = o.BranchCode,
                Address = o.Address,
                Country = o.Country,
                City = o.City,
                ContactPerson = o.ContactPerson,
                State = o.State,
                PostalCode = o.PostalCode,
                Email = o.Email,
                Phone = o.Phone,
                Fax = o.Fax,
                Logo = !string.IsNullOrEmpty(o.Logo) ? $"{Request.Scheme}://{Request.Host}/" + o.Logo : null,
                IsActive = o.IsActive,
                CreateDate = o.CreateDate,
                CreateBy = o.CreateBy,
                UpdateDate = o.UpdateDate,
                UpdateBy = o.UpdateBy,
                TaxNo = o.TaxNo,
                OrganizationId = o.OrganizationId,
                Organization = new Organization
                {
                    OrganizationId = o.Organization.OrganizationId,
                    OrganizationNameTh = o.Organization.OrganizationNameTh,
                    OrganizationNameEn = o.Organization.OrganizationNameEn,
                    OrganizationCode = o.Organization.OrganizationCode,
                    Email = o.Organization.Email,
                    Phone = o.Organization.Phone
                }
            }).ToList();

            // Prepare the response
            var response = new ApiResponse<Branch>
            {
                Data = dataDTO,
                TotalData = dataDTO.Count
            };

            return Ok(response);
        }
        public class BranchDTO : Branch
        {
            public IFormFile? LogoFile { get; set; }
        }
        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdateCompany([FromForm] BranchDTO branch)
        {
            if (branch == null)
            {
                return BadRequest(new { message = "Invalid tax data." });
            }

            try
            {
                var utcDateTime = DateTime.UtcNow;
                string logoPath = null;
                string faviconPath = null;

                // บันทึกไฟล์ลงเซิร์ฟเวอร์
                if (branch.LogoFile != null)
                {
                    logoPath = await SaveFileAsync(branch.LogoFile, "logo");
                }

                if (branch.BranchId > 0)
                {
                    // Update existingTasks
                    var existingOrg = await _context.Branchs
                        .FirstOrDefaultAsync(e => e.BranchId == branch.BranchId);

                    if (existingOrg == null)
                    {
                        throw new KeyNotFoundException($"Branch with ID {branch.BranchId} not found.");
                    }
                    string? ConvertToNullIfStringIsNull(string? value)
                    {
                        return value == "null" ? null : value;
                    }
                    existingOrg.UpdateBy = ConvertToNullIfStringIsNull(branch.UpdateBy);
                    existingOrg.UpdateDate = utcDateTime;
                    existingOrg.BranchNameTh = ConvertToNullIfStringIsNull(branch.BranchNameTh);
                    existingOrg.BranchNameEn = ConvertToNullIfStringIsNull(branch.BranchNameEn);
                    existingOrg.BranchCode = ConvertToNullIfStringIsNull(branch.BranchCode);
                    existingOrg.OrganizationId = branch.OrganizationId;
                    existingOrg.Address = ConvertToNullIfStringIsNull(branch.Address);
                    existingOrg.Country = ConvertToNullIfStringIsNull(branch.Country);
                    existingOrg.City = ConvertToNullIfStringIsNull(branch.City);
                    existingOrg.ContactPerson = ConvertToNullIfStringIsNull(branch.ContactPerson);
                    existingOrg.State = ConvertToNullIfStringIsNull(branch.State);
                    existingOrg.PostalCode = ConvertToNullIfStringIsNull(branch.PostalCode);
                    existingOrg.Email = ConvertToNullIfStringIsNull(branch.Email);
                    existingOrg.Phone = ConvertToNullIfStringIsNull(branch.Phone);
                    existingOrg.Fax = ConvertToNullIfStringIsNull(branch.Fax);
                    existingOrg.Logo = ConvertToNullIfStringIsNull(branch.Logo);
                    existingOrg.IsActive = branch.IsActive;
                    existingOrg.TaxNo = branch.TaxNo;
                    if (logoPath != null)
                    {
                        existingOrg.Logo = logoPath;
                    }

                    _context.Branchs.Update(existingOrg);
                }
                else
                {
                    var newOrg = new Branch
                    {
                        BranchCode = branch.BranchCode,
                        BranchNameTh = branch.BranchNameTh,
                        BranchNameEn = branch.BranchNameEn,
                        OrganizationId = branch.OrganizationId,
                        Address = branch.Address,
                        Country = branch.Country,
                        City = branch.City,
                        ContactPerson = branch.ContactPerson,
                        State = branch.State,
                        PostalCode = branch.PostalCode,
                        Email = branch.Email,
                        Phone = branch.Phone,
                        Fax = branch.Fax,
                        Logo = logoPath,
                        IsActive = branch.IsActive,
                        CreateDate = utcDateTime,
                        CreateBy = branch.CreateBy,
                        TaxNo = branch.TaxNo,
                    };

                    _context.Branchs.Add(newOrg);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Branch saved successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "update-Branch", branch.UpdateBy);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }


        [HttpDelete("delete")]
        public async Task<IActionResult> Delete(int id)
        {
            var branch = await _context.Branchs.FindAsync(id);
            if (branch == null)
            {
                return NotFound(new { message = "Branchs not found" });
            }
            _context.Branchs.Remove(branch);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Branchs deleted successfully" });
        }

        private async Task<string> SaveFileAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
            {
                return null;
            }

            var uploadsFolder = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot/uploads",
                folderName
            );

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // วันที่และเวลา
            var dateTimeNow = DateTime.Now.ToString("yyyyMMdd_HHmmss");
             
            // นามสกุลไฟล์
            var extension = Path.GetExtension(file.FileName);

            // ชื่อไฟล์ใหม่
            var fileName = $"{dateTimeNow}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // path สำหรับเก็บใน DB
            return Path.Combine("uploads", folderName, fileName).Replace("\\", "/");
        }
    }
}

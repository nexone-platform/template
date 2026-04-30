using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using System.Security.Claims;
using static solutionAPI.Controllers.EmployeeController;
using static solutionAPI.Controllers.HolidayController;
using static solutionAPI.Services.TasksService;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrganizationController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILoggingService _loggingService;
        public OrganizationController(ApplicationDbContext context, IMapper mapper, ILoggingService loggingService)
        {
            _mapper = mapper;
            _context = context;
            _loggingService = loggingService;
        }
        public class OrganizationSelectDto
        {
            public int? OrganizationId { get; set; }
            public int? ClientId { get; set; }

            public string OrganizationCode { get; set; }
            public string OrganizationName { get; set; }
        }

        [HttpGet("getMasterOrganization")]
        public async Task<ActionResult<IEnumerable<OrganizationSelectDto>>> GetOrganization()
        {
            var organizations =
                                (from org in _context.Organizations
                                 select new
                                 {
                                     OrganizationName = org.OrganizationNameEn,
                                     OrganizationCode = org.OrganizationCode,
                                     OrganizationId = (int?)org.OrganizationId,
                                     ClientId = (int?)null
                                 })
                                .Concat(
                                 from client in _context.Clients
                                 select new
                                 {
                                     OrganizationName = client.Company,
                                     OrganizationCode = client.ClientCode,
                                     OrganizationId = (int?)null,
                                     ClientId = (int?)client.ClientId
                                 })
                                .OrderBy(x => x.OrganizationCode)
                                .ToList();
            return Ok(organizations);
        }

        [HttpGet("getOrganizationUnionCompany")]
        public async Task<ActionResult<IEnumerable<Organization>>> GetOrganizationUnionCompany()
        {
            var organizations =  (from org in _context.Organizations
                                   select new
                                   {
                                       OrganizationName = org.OrganizationNameTh,
                                       OrganizationCode = org.OrganizationCode
                                   })
             .Concat(
              from client in _context.Clients
              select new
              {
                  OrganizationName = client.Company,
                  OrganizationCode = client.ClientCode
              }).OrderBy(x => x.OrganizationCode)
             .ToList();
            return Ok(organizations);
        }
        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            // Example using HttpContext
            /* var userId = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);*/

            return username;
        }

        [HttpGet]
        public async Task<ActionResult<Organization>> GetCompany()
        {
            var organization = await _context.Organizations.FirstOrDefaultAsync();

            if (organization == null)
            {
                return NotFound(new { message = "No organization found." });
            }

            // Map the first organization to OrganizationDTO
            var organizationDTO = new OrganizationDTO
            {
                OrganizationId = organization.OrganizationId,
                OrganizationNameTh = organization.OrganizationNameTh,
                OrganizationNameEn = organization.OrganizationNameEn,
                OrganizationCode = organization.OrganizationCode,
                Address = organization.Address,
                Country = organization.Country,
                City = organization.City,
                ContactPerson = organization.ContactPerson,
                State = organization.State,
                PostalCode = organization.PostalCode,
                Email = organization.Email,
                Phone = organization.Phone,
                Fax = organization.Fax,
                Url = organization.Url,
                Logo = !string.IsNullOrEmpty(organization.Logo) ? $"{Request.Scheme}://{Request.Host}/" + organization.Logo : null,
                Favicon = !string.IsNullOrEmpty(organization.Favicon) ? $"{Request.Scheme}://{Request.Host}/" + organization.Favicon : null,
                IsActive = organization.IsActive ?? true,
                CreateDate = organization.CreateDate,
                CreateBy = organization.CreateBy,
                UpdateDate = organization.UpdateDate,
                UpdateBy = organization.UpdateBy,
                TaxNo = organization.TaxNo,
            };

            return Ok(organizationDTO);
        }
        public class OrganizationDTO : Organization
        {
            public IFormFile? LogoFile { get; set; }
            public IFormFile? FaviconFile { get; set; }
        }


        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdateCompany([FromForm] OrganizationDTO organization)
        {
            if (organization == null)
            {
                return BadRequest(new { message = "Invalid tax data." });
            }

            try
            {
                var utcDateTime = DateTime.UtcNow;
                string logoPath = null;
                string faviconPath = null;

                // บันทึกไฟล์ลงเซิร์ฟเวอร์
                if (organization.LogoFile != null)
                {
                    logoPath = await SaveFileAsync(organization.LogoFile, "logo");
                }

                if (organization.FaviconFile != null)
                {
                    faviconPath = await SaveFileAsync(organization.FaviconFile, "favicon");
                }
                if (organization.OrganizationId > 0)
                {
                    // Update existingTasks
                    var existingOrg = await _context.Organizations
                        .FirstOrDefaultAsync(e => e.OrganizationId == organization.OrganizationId);

                    if (existingOrg == null)
                    {
                        throw new KeyNotFoundException($"Company with ID {organization.OrganizationId} not found.");
                    }
                    string? ConvertToNullIfStringIsNull(string? value)
                    {
                        return value == "null" ? null : value;
                    }

                    existingOrg.UpdateBy = ConvertToNullIfStringIsNull(organization.UpdateBy);
                    existingOrg.UpdateDate = utcDateTime;
                    existingOrg.OrganizationNameTh = ConvertToNullIfStringIsNull(organization.OrganizationNameTh);
                    existingOrg.OrganizationNameEn = ConvertToNullIfStringIsNull(organization.OrganizationNameEn);
                    existingOrg.OrganizationCode = ConvertToNullIfStringIsNull(organization.OrganizationCode);
                    existingOrg.Address = ConvertToNullIfStringIsNull(organization.Address);
                    existingOrg.Country = ConvertToNullIfStringIsNull(organization.Country);
                    existingOrg.City = ConvertToNullIfStringIsNull(organization.City);
                    existingOrg.ContactPerson = ConvertToNullIfStringIsNull(organization.ContactPerson);
                    existingOrg.State = ConvertToNullIfStringIsNull(organization.State);
                    existingOrg.PostalCode = ConvertToNullIfStringIsNull(organization.PostalCode);
                    existingOrg.Email = ConvertToNullIfStringIsNull(organization.Email);
                    existingOrg.Phone = ConvertToNullIfStringIsNull(organization.Phone);
                    existingOrg.Fax = ConvertToNullIfStringIsNull(organization.Fax);
                    existingOrg.Url = ConvertToNullIfStringIsNull(organization.Url);
                    existingOrg.Logo = ConvertToNullIfStringIsNull(organization.Logo);
                    existingOrg.IsActive = organization.IsActive;
                    existingOrg.TaxNo = organization.TaxNo;
                    if (logoPath != null)
                    {
                        existingOrg.Logo = logoPath;
                    }
                    if (faviconPath != null)
                    {
                        existingOrg.Favicon = faviconPath;
                    }

                    _context.Organizations.Update(existingOrg);
                }
                else
                {
                    var newOrg = new Organization
                    {
                        OrganizationNameTh = organization.OrganizationNameTh,
                        OrganizationNameEn = organization.OrganizationNameEn,
                        OrganizationCode = organization.OrganizationCode,
                        Address = organization.Address,
                        Country = organization.Country,
                        City = organization.City,
                        ContactPerson = organization.ContactPerson,
                        State = organization.State,
                        PostalCode = organization.PostalCode,
                        Email = organization.Email,
                        Phone = organization.Phone,
                        Fax = organization.Fax,
                        Url = organization.Url,
                        Logo = logoPath,
                        IsActive = organization.IsActive ?? true, // Default to true if null
                        CreateDate = utcDateTime,
                        CreateBy = organization.CreateBy,
                        Favicon = faviconPath,
                       TaxNo = organization.TaxNo,
                    };

                    _context.Organizations.Add(newOrg);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Company saved successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "update-SaveTaxDeductionAsync", organization.UpdateBy);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
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

            // นามสกุลไฟล์
            var extension = Path.GetExtension(file.FileName);

            // วันที่ + เวลา (เพิ่ม millisecond กันซ้ำ)
            var dateTimeNow = DateTime.Now.ToString("yyyyMMdd_HHmmssfff");

            // ชื่อไฟล์ใหม่
            var fileName = $"{dateTimeNow}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // path สำหรับเก็บใน DB
            return $"uploads/{folderName}/{fileName}";
        }

    }
}

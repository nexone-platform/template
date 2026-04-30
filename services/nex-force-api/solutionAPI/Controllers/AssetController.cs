using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using System.Security.Claims;
using Middlewares;
using Amazon.Auth.AccessControlPolicy;


namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AssetController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        public class AssetDTO : Asset
        {
            public AssigneeData? Assignee { get; set; }
        }
        public class AssetData : Asset
        {
            public string? AssetUser { get; set; }
        }
        public class AssigneeData
        {
            public string Name { get; set; }
            public string ProfileImg { get; set; }

            public string Email { get; set; }
            public decimal Id { get; set; }
        }
        private readonly ILoggingService _loggingService;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public AssetController(ApplicationDbContext context, IMapper mapper, ILoggingService loggingService)
        {
            _mapper = mapper;
            _loggingService = loggingService;
            _context = context;
        }
        [HttpGet("getAssets/{empId}")]
        public async Task<ActionResult<IEnumerable<AssetDTO>>> GetAssetByEmployee(decimal empId)
        {
            try
            {
                var assets = await _context.Assets
             .Include(a => a.Employee) // Include the Employee data
              .Where(a => a.EmployeeId == empId)
             .Select(a => new AssetDTO
             {
                 AssetId = a.AssetId,
                 AssetName = a.AssetName,
                 AssignedDate = a.AssignedDate,
                 AssetCode = a.AssetCode,
                 Category = a.Category,
                 Type = a.Type,
                 SerialNumber = a.SerialNumber,
                 Brand = a.Brand,
                 Cost = a.Cost,
                 Location = a.Location,
                 WarrantyStart = a.WarrantyStart,
                 WarrantyEnd = a.WarrantyEnd,
                 Vendor = a.Vendor,
                 AssetModel = a.AssetModel,
                 ProductNo = a.ProductNo,

                 AssetImg1 = !string.IsNullOrEmpty(a.AssetImg1) ?  a.AssetImg1 : null,
                 AssetImg2 = !string.IsNullOrEmpty(a.AssetImg2) ? a.AssetImg2 : null,
                 AssetImg3 = !string.IsNullOrEmpty(a.AssetImg3) ?  a.AssetImg3 : null,
                 AssetImg4 = !string.IsNullOrEmpty(a.AssetImg4) ?  a.AssetImg4 : null,

                 Assignee = a.Employee == null ? null : new AssigneeData
                 {
                     Name = a.Employee.FirstNameEn + ' ' + a.Employee.LastNameEn,
                     ProfileImg = !string.IsNullOrEmpty(a.Employee.ImgPath) ?  a.Employee.ImgPath : null,
                     Email = a.Employee.Email,
                     Id = a.Employee.Id
                 }
             })
             .ToListAsync();

                return Ok(assets);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "MyActionPage", "Username");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAssetById(int id)
        {
            var asset = await _context.Assets
                .AsNoTracking() // Optional: use if you don't need change tracking
                .Where(a => a.AssetId == id)
                .Select(a => new
                {
                    a.AssetId,
                    a.AssetName,
                    a.AssetModel,
                    a.SerialNumber,
                    a.Brand,
                    a.Cost,
                    a.Location,
                    a.WarrantyStart,
                    a.WarrantyEnd,
                    a.Vendor,
                    a.Category,
                    a.AssetCode,
                    a.Type,

                    AssetImg1 = string.IsNullOrEmpty(a.AssetImg1) ? null : a.AssetImg1,
                    AssetImg2 = string.IsNullOrEmpty(a.AssetImg2) ? null : a.AssetImg2,
                    AssetImg3 = string.IsNullOrEmpty(a.AssetImg3) ? null : a.AssetImg3,
                    AssetImg4 = string.IsNullOrEmpty(a.AssetImg4) ? null : a.AssetImg4,
                })
                .FirstOrDefaultAsync();
            if (asset == null)
            {
                return NotFound(); // Return 404 if not found
            }
            return Ok(asset); // Return 200 with the asset data
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteAsset(int id)
        {
            var assets = await _context.Assets.FindAsync(id);
            if (assets == null)
            {
                return NotFound(new { message = "Assets not found" });
            }
            _context.Assets.Remove(assets);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Assets deleted successfully" });
        }

        [HttpGet("getAssets")]
        public async Task<ActionResult<IEnumerable<AssetDTO>>> GeAllAsset()
        {
            try
            {
                var assets = await _context.Assets
             .Include(a => a.Employee) // Include the Employee data
             .Select(a => new AssetData
             {
                 AssetId = a.AssetId,
                 AssetName = a.AssetName,
                 AssignedDate = a.AssignedDate,
                 AssetCode = a.AssetCode,
                 Category = a.Category,
                 Type = a.Type,
                 SerialNumber = a.SerialNumber,
                 Brand = a.Brand,
                 Cost = a.Cost,
                 Location = a.Location,
                 WarrantyStart = a.WarrantyStart,
                 WarrantyEnd = a.WarrantyEnd,
                 Vendor = a.Vendor,
                 AssetModel = a.AssetModel,
                 ProductNo = a.ProductNo,
                 Supplier = a.Supplier,
                 Warranty = a.Warranty,
                 Status = a.Status,
                 Description = a.Description,
                 EmployeeId =a.EmployeeId,
                 AssetImg1 = !string.IsNullOrEmpty(a.AssetImg1) ? $"{Request.Scheme}://{Request.Host}/" + a.AssetImg1 : null,
                 AssetImg2 = !string.IsNullOrEmpty(a.AssetImg2) ? $"{Request.Scheme}://{Request.Host}/" + a.AssetImg2 : null,
                 AssetImg3 = !string.IsNullOrEmpty(a.AssetImg3) ? $"{Request.Scheme}://{Request.Host}/" + a.AssetImg3 : null,
                 AssetImg4 = !string.IsNullOrEmpty(a.AssetImg4) ? $"{Request.Scheme}://{Request.Host}/" + a.AssetImg4 : null,
                 AssetUser = a.Employee.FirstNameEn + ' ' + a.Employee.LastNameEn,
                 Condition =a.Condition
             })
             .ToListAsync();
                var response = new ApiResponse<AssetData>
                {
                    Data = assets,
                    TotalData = assets.Count
                };
                return Ok(response);

            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "asset-main", "Username");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpPost("update")]
        public async Task<ActionResult<IEnumerable<AssetDto>>> CreateOrUpdateAsset([FromForm] AssetDto assetDto)
        {
            var localDateTime = DateTime.Now; // Local time
            var utcDateTime = localDateTime.ToUniversalTime(); // Convert to UTC

            if (assetDto == null)
            {
                return BadRequest(new { message = "Invalid asset data." });
            }

            if (assetDto.AssetId > 0)
            {
                // Update existing asset
                var existingAsset = await _context.Assets
                    .FirstOrDefaultAsync(e => e.AssetId == assetDto.AssetId);

                if (existingAsset == null)
                {
                    return NotFound(new { message = $"Asset with ID {assetDto.AssetId} not found." });
                }

                if (assetDto.AssetImg1 != null)
                {
                    existingAsset.AssetImg1 = await SaveFileAsync(assetDto.AssetImg1);
                }
                if (assetDto.AssetImg2 != null)
                {
                    existingAsset.AssetImg2 = await SaveFileAsync(assetDto.AssetImg2);
                }
                if (assetDto.AssetImg3 != null)
                {
                    existingAsset.AssetImg3 = await SaveFileAsync(assetDto.AssetImg3);
                }
                if (assetDto.AssetImg4 != null)
                {
                    existingAsset.AssetImg4 = await SaveFileAsync(assetDto.AssetImg4);
                }

                existingAsset.UpdateBy = assetDto.UpdateBy;
                existingAsset.UpdateDate = utcDateTime;
                existingAsset.AssetName = assetDto.AssetName;
                existingAsset.WarrantyStart = assetDto.WarrantyStart.HasValue? assetDto.WarrantyStart.Value.ToUniversalTime() : null;
                existingAsset.WarrantyEnd = assetDto.WarrantyEnd.HasValue? assetDto.WarrantyEnd.Value.ToUniversalTime():null;
                existingAsset.Warranty = assetDto.Warranty;
                existingAsset.Cost = assetDto.Cost;
                existingAsset.EmployeeId = assetDto.AssetUser;
                existingAsset.Status = assetDto.AssetStatus;
                existingAsset.Vendor = assetDto.Vendor;
                existingAsset.AssetModel = assetDto.AssetModel;
                existingAsset.SerialNumber = assetDto.SerialNumber;
                existingAsset.Location = assetDto.Location;
                existingAsset.Condition = assetDto.Condition;
                existingAsset.Description = assetDto.Description;
                existingAsset.AssetCode = assetDto.AssetCode;

                _context.Assets.Update(existingAsset);
            }
            else
            {

                // Add new asset
                var maxId = await _context.Assets.MaxAsync(e => (int?)e.AssetId) ?? 0;
                maxId += 1;

                var newAsset = new Asset
                {
                    AssetId = maxId,
                    Type = assetDto.Type,
                    Brand = assetDto.Brand,
                    AssetCode  = assetDto.AssetCode,
                    AssetName = assetDto.AssetName,
                    WarrantyStart = assetDto.WarrantyStart.HasValue ? assetDto.WarrantyStart.Value.ToUniversalTime() : null,
                    WarrantyEnd = assetDto.WarrantyEnd.HasValue ? assetDto.WarrantyEnd.Value.ToUniversalTime() : null,
                    Warranty = assetDto.Warranty,
                    Cost = assetDto.Cost,
                    EmployeeId = assetDto.AssetUser,
                    Status = assetDto.AssetStatus,
                    Vendor = assetDto.Vendor,
                    AssetModel = assetDto.AssetModel,
                    SerialNumber = assetDto.SerialNumber,
                    Location = assetDto.Location,
                    Condition = assetDto.Condition,
                    Description = assetDto.Description,      
                    CreateDate = utcDateTime,
                    CreateBy = assetDto.CreateBy
                };
                // Handle new asset images
                if (assetDto.AssetImg1 != null)
                {
                    newAsset.AssetImg1 = await SaveFileAsync(assetDto.AssetImg1);
                }
                if (assetDto.AssetImg2 != null)
                {
                    newAsset.AssetImg2 = await SaveFileAsync(assetDto.AssetImg2);
                }
                if (assetDto.AssetImg3 != null)
                {
                    newAsset.AssetImg3 = await SaveFileAsync(assetDto.AssetImg3);
                }
                if (assetDto.AssetImg4 != null)
                {
                    newAsset.AssetImg4 = await SaveFileAsync(assetDto.AssetImg4);
                }
                _context.Assets.Add(newAsset);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Asset saved successfully" });
        }

        private async Task<string> SaveFileAsync(IFormFile file)
        {
            // Define the path where the images will be saved
            var uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "asset");

            // Ensure the directory exists
            if (!Directory.Exists(uploadDirectory))
            {
                Directory.CreateDirectory(uploadDirectory);
            }

            // Get original file name without extension
            var fileNameWithoutExt = Path.GetFileNameWithoutExtension(file.FileName);
            var extension = Path.GetExtension(file.FileName);

            // Create datetime string (yyyyMMdd_HHmmss)
            var dateTimeNow = DateTime.Now.ToString("yyyyMMdd_HHmmss");

            // Generate unique file name
            var uniqueFileName = $"{fileNameWithoutExt}_{dateTimeNow}_{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadDirectory, uniqueFileName);

            // Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return relative path for DB
            return Path.Combine("asset", uniqueFileName).Replace("\\", "/");
        }
        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            return username;
        }
    }

    public class AssetDto
    {
        public string? Type { get; set; }
        public string? Brand { get; set; }
        public string? AssetCode { get; set; }
        public string? AssetName { get; set; }
        public int? AssetId { get; set; }
        public DateTime? WarrantyStart { get; set; }
        public DateTime? WarrantyEnd { get; set; }
        public decimal? Warranty { get; set; }
        public decimal? Cost { get; set; }
        public decimal? AssetUser { get; set; }
        public string? AssetStatus { get; set; }
        public string? Vendor { get; set; }
        public string? AssetModel { get; set; }
        public string? SerialNumber { get; set; }
        public string? Location { get; set; }
        public string? Condition { get; set; }
        public string? Description { get; set; }
        public IFormFile? AssetImg1 { get; set; }
        public IFormFile? AssetImg2 { get; set; }
        public IFormFile? AssetImg3 { get; set; }
        public IFormFile? AssetImg4 { get; set; }
        public string? CreateBy { get; set; }                 // Creator's name
        public string? UpdateBy { get; set; }
    }
}

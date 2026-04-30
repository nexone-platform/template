using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Middleware.Data;
using Middleware.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DesignationsController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public class DesignationDTO : Designation
        {
            public string? DepartmentNameTh { get; set; }
            public string? DepartmentNameEn { get; set; }

        }
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public DesignationsController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }
        [HttpGet("getAllDesignation")]
        public async Task<ActionResult<IEnumerable<DesignationDTO>>> GetDesignation()
        {
            var designation = await (from e in _context.Designations
                                     join r in _context.Departments on e.DepartmentId equals r.DepartmentId
                                   select new DesignationDTO
                                   {
                                       DesignationId = e.DesignationId,
                                       DesignationNameTh = e.DesignationNameTh,
                                       DesignationNameEn = e.DesignationNameEn,
                                       DepartmentId = e.DepartmentId,
                                       DepartmentNameTh = r.DepartmentNameTh,
                                       DepartmentNameEn = r.DepartmentNameEn,
                                       CreateDate = e.CreateDate,
                                       CreateBy = e.CreateBy,
                                       UpdateDate = e.UpdateDate,
                                       UpdateBy = e.UpdateBy,
                                       DesignationCode = e.DesignationCode,

                                   }).OrderBy(x => x.DesignationCode).ToListAsync();

            var response = new ApiResponse<DesignationDTO>
            {
                Data = designation,
                TotalData = designation.Count
            };
            return Ok(response);
        }

        [HttpPost("update")]
        public async Task<ActionResult<IEnumerable<Designation>>> CreateOrUpdateEmployee([FromBody] DesignationDTO designation)
        {

            if (designation == null)
            {
                return BadRequest(new { message = "Invalid designation data." });
            }
            try
            {
                if (designation.DesignationId > 0)
                {  // Update existing 
                    var existingDesignation = await _context.Designations
                        .FirstOrDefaultAsync(e => e.DesignationId == designation.DesignationId);
                    if (existingDesignation == null)
                    {
                        return NotFound(new { message = $"Designation with  {designation.DesignationNameTh} not found." });
                    }
                    existingDesignation.UpdateBy = GetCurrentUserId();
                    existingDesignation.UpdateDate = DateTime.UtcNow;
                    existingDesignation.DesignationNameTh = designation.DesignationNameTh;
                    existingDesignation.DesignationNameEn = designation.DesignationNameEn;
                    existingDesignation.DepartmentId = designation.DepartmentId;
                    existingDesignation.DesignationCode = designation.DesignationCode;
                    existingDesignation.CreateDate = designation.CreateDate;
                    existingDesignation.IsActive = true;
                    _context.Designations.Update(existingDesignation);
                }
                else
                {
                    var maxId = await _context.Designations
                                .MaxAsync(e => (int?)e.DesignationId);
                    if (maxId == null)
                    {
                        // Handle the case where the table is empty
                        maxId = 0;
                    }
                    else
                    {
                        maxId = maxId + 1;
                    }

                    var newDesignations = new Designation
                    {
                        DesignationId = (int)maxId,
                        DesignationNameTh = designation.DesignationNameTh,
                        DesignationNameEn  = designation.DesignationNameEn,
                        DepartmentId = designation.DepartmentId,
                        IsActive = true,
                        CreateDate = DateTime.UtcNow,
                        DesignationCode = designation.DesignationCode,  
                        CreateBy = GetCurrentUserId()
                    };


                    _context.Designations.Add(newDesignations);
                }
                await _context.SaveChangesAsync();

                return Ok(new { message = "Designation save successfully" });
            }
            catch (DbUpdateException ex)
            {
                // 🔴 กรณี Unique constraint (designation_code + department_id) ซ้ำ
                if (ex.InnerException != null &&
                    ex.InnerException.Message.Contains("ix-uk-designation"))
                {
                    return Conflict(new
                    {
                        message = "Designation code already exists in this department."
                    });
                }

                return StatusCode(500, new
                {
                    message = "Database update error.",
                    detail = ex.InnerException?.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Unexpected error occurred.",
                    detail = ex.Message
                });
            }
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteDesignation(int id)
        {
            var designation = await _context.Designations.FindAsync(id);
            if (designation == null)
            {
                return NotFound(new { message = "Designation not found" });
            }
            _context.Designations.Remove(designation);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Designation deleted successfully" });
        }

        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            // Example using HttpContext
            /* var userId = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);*/

            return username;
        }

    }
}

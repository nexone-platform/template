using AutoMapper;
using HrService.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using NuGet.ContentModel;
using System.Security.Claims;
using static HrService.Services.PayrolItemService;
using static Middlewares.Constant.StatusConstant;


namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PayrolItemController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly PayrolItemService _payrolItemService;
        private readonly ILoggingService _loggingService;
        public PayrolItemController(ApplicationDbContext context, IMapper mapper, PayrolItemService payrolItemService, ILoggingService loggingService)
        {
            _mapper = mapper;
            _context = context;
            _payrolItemService = payrolItemService;
            _loggingService = loggingService;
        }
         
        [HttpGet("getAdditions")]
        public async Task<ActionResult<List<AdditionsWithAssignmentsDto>>> GetAdditionsWithAssignments()
        {
            var result = await _payrolItemService.GetAdditionsWithAssignments();
            return Ok(result);
        }

        [HttpGet("getDeductions")]
        public async Task<ActionResult<IEnumerable<DeductionsWithAssignmentsDto>>> GetDeductions()
        {
            var result = await _payrolItemService.GetDeductionWithAssignments();
            return Ok(result);
        }

        [HttpPost("updateAddition")]
        public async Task<IActionResult> AddAddition([FromBody] AdditionRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {   if(model.AdditionsId == 0)
                {
                    var response = await _payrolItemService.AddAdditionAsync(model);
                    return response;
                } else
                {
                    var response = await _payrolItemService.UpdateAdditionAsync(model);
                    return response;
                }

                
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "MyActionPage", "Username");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpPost("updateDeduction")]
        public async Task<IActionResult> AddDeduction([FromBody] DeductionRequest model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                if (model.DeductionId == 0)
                {
                    var response = await _payrolItemService.AddDeductionAsync(model);
                    return response;
                }
                else
                {
                    var response = await _payrolItemService.UpdateDeductionAsync(model);
                    return response;
                }


            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "MyActionPage", "Username");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpDelete("deleteAddition")]
        public async Task<IActionResult> DeleteAddition(int id)
        {
            var additions = await _context.Additions.FindAsync(id);
            if (additions == null)
            {
                return NotFound(new { message = "Additions not found" });
            }

            var assign = await _context.AdditionEmployeeAssignments.FindAsync(id);
            if (assign != null)
            {
                _context.AdditionEmployeeAssignments.Remove(assign);
            }
            _context.Additions.Remove(additions);
           
            await _context.SaveChangesAsync();

            return Ok(new { message = "Additions deleted successfully" });
        }

        [HttpDelete("deleteDeduction")]
        public async Task<IActionResult> DeleteDeduction(int id)
        {
            var additions = await _context.Deductions.FindAsync(id);
            if (additions == null)
            {
                return NotFound(new { message = "Deduction not found" });
            }

            var assign = await _context.DeductionEmployeeAssignments.FindAsync(id);
            if (assign != null)
            {
                _context.DeductionEmployeeAssignments.Remove(assign);
            }
            _context.Deductions.Remove(additions);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Deduction deleted successfully" });
        }
        public class AdditionRequest
        {
            public int AdditionsId { get; set; } // Primary Key
            public string? AdditionsName { get; set; }
            public AdditionTypeEnum? AdditionType { get; set; }
            public bool IsActive { get; set; }
            public decimal? UnitAmount { get; set; }
            public decimal? PercentAmount { get; set; }
            public AssignmentType? AssigneeType { get; set; }
            public string? AmountType { get; set; }
            public List<int>? ExceptedEmployees { get; set; }
            public List<int>? ProjectId { get; set; }
            public List<int>? DepartmentId { get; set; }
            public List<int>? EmployeeId { get; set; }
            public Assignees? Assignees { get; set; }
        }

        public class DeductionRequest
        {
            public int DeductionId { get; set; } // Primary Key
            public string? DeductionName { get; set; }
            public DeductionTypeEnum? DeductionType { get; set; }
            public bool IsActive { get; set; }
            public decimal? UnitAmount { get; set; }
            public decimal? PercentAmount { get; set; }
            public AssignmentType? AssigneeType { get; set; }
            public string? AmountType { get; set; }
            public List<int>? ExceptedEmployees { get; set; }
            public List<int>? ProjectId { get; set; }
            public List<int>? DepartmentId { get; set; }
            public List<int>? EmployeeId { get; set; }
            public Assignees? Assignees { get; set; }
        }

        public class Assignees
        {
            public AssignmentType? Type { get; set; }
            public List<int>? EmployeeIds { get; set; }
            public List<int>? DepartmentId { get; set; }
            public List<int>? ProjectId { get; set; }
        }

        public class AdditionsWithAssignmentsDto
        {
            public int AdditionsId { get; set; }
            public string? AdditionsName { get; set; }
            public string? AdditionsCode { get; set; }
            public string? AdditionsCategory { get; set; }
            public bool? IsActive { get; set; }
            public decimal? UnitAmount { get; set; }
            public decimal? PercentAmount { get; set; }
            public AdditionTypeEnum? AdditionType { get; set; }
            public List<AdditionEmployeeAssignmentDto> Assignments { get; set; }
        }

        public class AdditionEmployeeAssignmentDto
        {
            public int AssignmentId { get; set; }
            public int AdditionsId { get; set; }
            public int AssignmentType { get; set; }
            public int? EmployeeId { get; set; }
            public int? DepartmentId { get; set; }
            public int? ProjectId { get; set; }
            public int? ExceptedEmployeeIds { get; set; }
            public DateTime AssignedDate { get; set; }
 
            public bool IsActive { get; set; }
        }

        public class DeductionsWithAssignmentsDto
        {
            public int DeductionId { get; set; }
            public string? DeductionName { get; set; }
            public string? DeductionCode { get; set; }
            public string? DeductionCategory { get; set; }
            public bool? IsActive { get; set; }
            public decimal? UnitAmount { get; set; }
            public decimal? PercentAmount { get; set; }
            public DeductionTypeEnum? DedutionType { get; set; }
            public List<DeductionsEmployeeAssignmentDto> Assignments { get; set; }
        }

        public class DeductionsEmployeeAssignmentDto
        {
            public int AssignmentId { get; set; }
            public int DeductionId { get; set; }
            public int AssignmentType { get; set; }
            public int? EmployeeId { get; set; }
            public int? DepartmentId { get; set; }
            public int? ProjectId { get; set; }
            public int? ExceptedEmployeeIds { get; set; }
            public DateTime AssignedDate { get; set; }
            public bool IsActive { get; set; }
        }
    }
}

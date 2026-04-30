
using AutoMapper;
using Consul;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Helpers;
using Middlewares.Models;
using static Middlewares.Constant.StatusConstant;
using static performance_server.Controllers.ResignationsController;

namespace performance_server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ResignationsController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public class ResignationDto
        {
            public decimal ResignationId { get; set; }
            public decimal EmployeeId { get; set; }
            public string? EmployeeName { get; set; }
            public string? DepartmentName { get; set; }
            public DateTime? NoticeDate { get; set; }
            public DateTime? ResignationDate { get; set; }
            public DateTime? RequestDate { get; set; }
            public string? Reason { get; set; }
            public bool IsApproved { get; set; }
            public decimal? ApprovedId { get; set; }
            public string? ApprovedBy { get; set; }  // Approver's name
            public string? ApprovedByImgPath { get; set; }  // Approver's image path
            public DateTime? ApprovalDate { get; set; }
            public string? Comments { get; set; }
            public string? ImgPath { get; set; }  // Resigning employee's image path
            public DateTime? CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public DateTime? UpdateDate { get; set; }
            public string? UpdateBy { get; set; }
            public string? Status { get; set; }
        }

        private readonly ILoggingService _loggingService;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IServiceProvider _serviceProvider;
        public ResignationsController(ApplicationDbContext context, IMapper mapper, ILoggingService loggingService, IServiceProvider serviceProvider    )
        {
            _mapper = mapper;
            _loggingService = loggingService;
            _context = context;
            _serviceProvider = serviceProvider;
        }

        [HttpGet("getAllResignations")]
        public async Task<ActionResult<ApiResponse<ResignationDto>>> GetAllResignations()
        {
            var resignations = await (from r in _context.Resignations
                                      join e in _context.Employees on r.EmployeeId equals e.Id
                                      join d in _context.Departments on e.DepartmentId equals d.DepartmentId into departments
                                      from department in departments.DefaultIfEmpty() // Handle cases where department might be null
                                      join a in _context.Employees on r.ApprovedId equals a.Id into approvers
                                      from approver in approvers.DefaultIfEmpty()  // Handle cases where the resignation isn't approved
                                      select new ResignationDto
                                      {
                                          ResignationId = r.ResignationId,
                                          EmployeeId = r.EmployeeId,
                                          EmployeeName = e.FirstNameEn + " "+ e.LastNameEn,
                                          DepartmentName = department != null ? department.DepartmentNameEn : null, // Add department name
                                          NoticeDate = r.NoticeDate,
                                          ResignationDate = r.ResignationDate,
                                          RequestDate = r.RequestDate,
                                          Reason = r.Reason,
                                          IsApproved = r.IsApproved,
                                          ApprovedId = r.ApprovedId,
                                          ApprovedBy = approver != null ? approver.FirstNameEn + " " + approver.LastNameEn: null,
                                          ApprovedByImgPath = approver != null && !string.IsNullOrEmpty(approver.ImgPath) ?
                                                             approver.ImgPath : null,
                                          ApprovalDate = r.ApprovalDate,
                                          Comments = r.Comments,
                                          ImgPath = !string.IsNullOrEmpty(e.ImgPath) ?
                                                    e.ImgPath : null,
                                          CreateDate = r.CreateDate,
                                          CreateBy = r.CreateBy,
                                          UpdateDate = r.UpdateDate,
                                          UpdateBy = r.UpdateBy,
                                          Status = r.Status
                                      }).ToListAsync();

            var response = new ApiResponse<ResignationDto>
            {
                Data = resignations,
                TotalData = resignations.Count()
            };
            return Ok(response);
        }

        [HttpGet("getResignationsById/{id}")]
        public async Task<ActionResult<ApiResponse<ResignationDto>>> GetResignationsById(int id)
        {
            var resignations = await (from r in _context.Resignations
                                      join e in _context.Employees on r.EmployeeId equals e.Id
                                      join d in _context.Departments on e.DepartmentId equals d.DepartmentId into departments
                                      from department in departments.DefaultIfEmpty() // Handle cases where department might be null
                                      join a in _context.Employees on r.ApprovedId equals a.Id into approvers
                                      from approver in approvers.DefaultIfEmpty() // Handle cases where the resignation isn't approved
                                      where r.EmployeeId == id // Filter by employeeId
                                      select new ResignationDto
                                      {
                                          ResignationId = r.ResignationId,
                                          EmployeeId = r.EmployeeId,
                                          EmployeeName = e.FirstNameEn + " " + e.LastNameEn,
                                          DepartmentName = department != null ? department.DepartmentNameEn : null, // Add department name
                                          NoticeDate = r.NoticeDate,
                                          ResignationDate = r.ResignationDate,
                                          RequestDate = r.RequestDate,
                                          Reason = r.Reason,
                                          IsApproved = r.IsApproved,
                                          ApprovedId = r.ApprovedId,
                                          ApprovedBy = approver != null ? approver.FirstNameEn + " " + approver.LastNameEn : null,
                                          ApprovedByImgPath = approver != null && !string.IsNullOrEmpty(approver.ImgPath) ?
                                                              approver.ImgPath : null,
                                          ApprovalDate = r.ApprovalDate,
                                          Comments = r.Comments,
                                          ImgPath = !string.IsNullOrEmpty(e.ImgPath) ?
                                                    e.ImgPath : null,
                                          CreateDate = r.CreateDate,
                                          CreateBy = r.CreateBy,
                                          UpdateDate = r.UpdateDate,
                                          UpdateBy = r.UpdateBy,
                                         
                                          Status = r.Status
                                      }).ToListAsync();

            var response = new ApiResponse<ResignationDto>
            {
                Data = resignations,
                TotalData = resignations.Count()
            };

            return Ok(response);
        }

        [HttpPost("update")]
        public async Task<IActionResult> CreateOrUpdateResignation([FromBody] UpdateResignationDto resignationDto)
        {
            if (resignationDto == null)
            {
                return BadRequest(new { message = "Invalid resignation data." });
            }
            var refId = await _context.ApprovalReferences
                .Where(r => EF.Functions.ILike(r.RefType, "resignation"))
                .Select(r => r.RefId)
                .FirstOrDefaultAsync();

            if (resignationDto.ResignationId > 0)
            {
                // Update existing resignation
                var existingResignation = await _context.Resignations
                    .FirstOrDefaultAsync(r => r.ResignationId == resignationDto.ResignationId);

                if (existingResignation == null)
                {
                    return NotFound(new { message = $"Resignation with ID {resignationDto.ResignationId} not found." });
                }

                // Update resignation fields
                existingResignation.EmployeeId = resignationDto.EmployeeId;
                existingResignation.NoticeDate = resignationDto.NoticeDate.ToUniversalTime();
                existingResignation.ResignationDate = resignationDto.ResignationDate.ToUniversalTime();
                existingResignation.Reason = resignationDto.Reason;
                existingResignation.UpdateDate = DateTime.UtcNow;
                existingResignation.UpdateBy = resignationDto.Username;
                existingResignation.RefId = refId;

                _context.Resignations.Update(existingResignation);

                var existingStatus = await _context.ApprovalStatuses
                        .FirstOrDefaultAsync(s => s.RefType == "resignation" && s.RefRequestId == resignationDto.ResignationId);

                if (existingStatus != null)
                {
                    existingStatus.UpdateDate = DateTime.UtcNow;
                    existingStatus.UpdateBy = resignationDto.Username;
                    existingStatus.Status = LeaveRequestStatus.New.ToString(); // หรือ Pending
                    _context.ApprovalStatuses.Update(existingStatus);
                }
            }
            else
            {
                // Create new resignation
                var resignationId = await _context.Resignations
                    .MaxAsync(r => (int?)r.ResignationId) ?? 0;

                resignationId = resignationId + 1;
                var newResignation = new Resignation
                {
                    ResignationId = resignationId,
                    EmployeeId = resignationDto.EmployeeId,
                    NoticeDate = resignationDto.NoticeDate,
                    ResignationDate = resignationDto.ResignationDate,
                    Reason = resignationDto.Reason,
                    CreateDate = DateTime.UtcNow,
                    Status = LeaveRequestStatus.New.ToString(),
                    CreateBy = resignationDto.Username,
                    RefId = refId,
                    CurrentApprovalLevel = 1
                };

                _context.Resignations.Add(newResignation);
                var ruleId = await _context.ApprovalSteps
                  .Where(s => s.RefId == refId && s.StepOrder == 1)
                  .Select(s => s.RuleId)
                  .FirstOrDefaultAsync();
                var status = new ApprovalStatus
                {
                    RefType = "resignation",
                    RefId = refId,
                    RefRequestId = (int)resignationId,
                    Status = LeaveRequestStatus.New.ToString(),
                    RequestedBy = (int)resignationDto.EmployeeId,
                    RequestedAt = DateTime.UtcNow,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = resignationDto.Username,
                    CurrentStepOrder = 1,
                    RuleId = ruleId
                };

                _context.ApprovalStatuses.Add(status);

                var emp = _context.Employees.Where(e => e.Id == resignationDto.EmployeeId).FirstOrDefault();

                var values = new Dictionary<string, string>
                    {
                        { "EmployeeName", emp.FirstNameEn + " " + emp.LastNameEn },
                        { "ResignationDate", resignationDto.ResignationDate.ToString() },
                        { "Reason", resignationDto.Reason },
                    };

                var languageCode = "en";
                var (subject, message) = await EmailHelper.GetTemplateWithContentAsync(
                                        _serviceProvider,
                                        "RESIGNATION_REQUEST",
                                        values,
                                        languageCode
                                    );

                if (string.IsNullOrWhiteSpace(emp.Email))
                    throw new InvalidOperationException("Employee email not found.");

                if (string.IsNullOrWhiteSpace(subject) || string.IsNullOrWhiteSpace(message))
                    throw new InvalidOperationException("Email template not found or invalid.");

                // ส่งอีเมล
                await EmailHelper.SendEmailBySettingAsync(_serviceProvider, emp.Email, subject, message);
                // var (subject, message) = await _emailService.GetTemplateWithContentAsync("RESIGNATION_REQUEST", values, languageCode);

                /*                    if (!string.IsNullOrWhiteSpace(users.Email) &&
                                        !string.IsNullOrWhiteSpace(subject) &&
                                        !string.IsNullOrWhiteSpace(message))
                                    {
                                        await _emailService.SendEmailAsync(users.Email, subject, message);
                                    }
                                    else if (users.Email == null)
                                    {

                                        return BadRequest(new { message = "Email not found." });
                                    }*/
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Resignation saved successfully." });
        }

        [HttpPost("approve/{id}")]
        public async Task<IActionResult> UpdateLeaveRequestStatus(decimal id, [FromBody] StatusRequest request)
        {
            var currentUser = request.Username; // Get the current user from the identity
            var approverId = request.ApproverId;

            try
            {
                var resignation = await _context.Resignations.FindAsync(id);
                if (resignation == null)
                {
                    throw new Exception("Resignations not found.");
                };

                // Update the leave request status based on the provided status
                resignation.Status = request.Status.ToString();
                resignation.Comments = request.Comments;
                resignation.UpdateDate = DateTime.UtcNow;
                resignation.UpdateBy = currentUser;
                resignation.ApprovedId = approverId;
                resignation.ApprovalDate = DateTime.UtcNow;
               
                resignation.ResignationDate = resignation.ResignationDate.HasValue ? resignation.ResignationDate.Value.ToUniversalTime() : (DateTime?)null;
                resignation.NoticeDate = resignation.NoticeDate.HasValue ? resignation.NoticeDate.Value.ToUniversalTime() : (DateTime?)null;
                resignation.RequestDate = resignation.RequestDate.HasValue ? resignation.RequestDate.Value.ToUniversalTime() : (DateTime?)null;
                resignation.CreateDate = resignation.CreateDate.HasValue ? resignation.CreateDate.Value.ToUniversalTime() : (DateTime?)null;


                // If the status is "Approved," make the employee inactive
                if (request.Status.ToString().Equals(LeaveRequestStatus.Approved.ToString(), StringComparison.OrdinalIgnoreCase))
                {
                    resignation.IsApproved = true;
                    var employee = await _context.Employees.FindAsync(resignation.EmployeeId);
                    if (employee != null)
                    {
                        employee.IsActive = false;
                        employee.ResignationDate =  resignation.ResignationDate.HasValue ? resignation.ResignationDate.Value.ToUniversalTime() : (DateTime?)null;
                        employee.UpdateDate = DateTime.UtcNow;
                        employee.CreateDate = employee.CreateDate.HasValue ? employee.CreateDate.Value.ToUniversalTime() : (DateTime?)null;
                        employee.BirthDate = employee.BirthDate.HasValue ? employee.BirthDate.Value.ToUniversalTime() : (DateTime?)null;
                        employee.JoinDate = employee.JoinDate.HasValue ? employee.JoinDate.Value.ToUniversalTime() : (DateTime?)null;
                        employee.PassportExpiryDate = employee.PassportExpiryDate.HasValue ? employee.PassportExpiryDate.Value.ToUniversalTime() : (DateTime?)null;
                        employee.UpdateBy = currentUser;
                        _context.Employees.Update(employee);
                    }

                    var emp = _context.Employees.Where(e => e.Id == resignation.EmployeeId).FirstOrDefault();

                    var values = new Dictionary<string, string>
                    {
                        { "EmployeeName", emp.FirstNameEn + " " + emp.LastNameEn },
                        { "ResignationDate", resignation.ResignationDate.ToString() },
                    };

                    var languageCode = "en";
                    var (subject, message) = await EmailHelper.GetTemplateWithContentAsync(
                        _serviceProvider,
                        "RESIGNATION_APPROVED",
                        values,
                        languageCode
                    );

                    if (string.IsNullOrWhiteSpace(emp.Email))
                        throw new InvalidOperationException("Employee email not found.");

                    if (string.IsNullOrWhiteSpace(subject) || string.IsNullOrWhiteSpace(message))
                        throw new InvalidOperationException("Email template not found or invalid.");

                    // ส่งอีเมล
                    await EmailHelper.SendEmailBySettingAsync(_serviceProvider, emp.Email, subject, message);
                    //  var (subject, message) = await _emailService.GetTemplateWithContentAsync("RESIGNATION_APPROVED", values, languageCode);

                    /*                    if (!string.IsNullOrWhiteSpace(users.Email) &&
                                            !string.IsNullOrWhiteSpace(subject) &&
                                            !string.IsNullOrWhiteSpace(message))
                                        {
                                            await _emailService.SendEmailAsync(users.Email, subject, message);
                                        }
                                        else if (users.Email == null)
                                        {

                                            return BadRequest(new { message = "Email not found." });
                                        }*/

                }
                _context.Resignations.Update(resignation);
                await _context.SaveChangesAsync();
                return Ok(resignation);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "update-Resignations-status", currentUser);
                return StatusCode(500, new { message = "An error occurred while updating the Resignations status." });
            }
        }

        [HttpGet("pendingApprovalCount")]
        public async Task<ActionResult<int>> GetPendingApprovalCountAsync()
        {
            try
            {
                // Count the number of pending requests
                var pendingCount = await _context.Resignations
                    .CountAsync(o => o.Status == LeaveRequestStatus.New.ToString());

                // Return the count
                return Ok(pendingCount);
            }
            catch (Exception ex)
            {
                // Handle errors gracefully
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetResignationById(int id)
        {
            var overtime = await _context.Resignations
                .FirstOrDefaultAsync(o => o.ResignationId == id);

            if (overtime == null)
                return NotFound(new { message = $"Resignations request {id} not found." });

            return Ok(overtime);
        }
        public class UpdateResignationDto
        {
            public int ResignationId { get; set; }
            public int EmployeeId { get; set; }
            public DateTime NoticeDate { get; set; }
            public DateTime ResignationDate { get; set; }
            public string Reason { get; set; }
            public string Username { get; set; }
        }

        public class StatusRequest
        {
            public LeaveRequestStatus Status { get; set; }
            public decimal ApproverId { get; set; } // Assuming ApproverId is of type decimal
            public string? Username { get; set; }
            public string? Comments { get; set; }
        }
    }
}

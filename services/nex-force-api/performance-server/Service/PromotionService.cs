
using Azure.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Helpers;
using Middlewares.Models;
using System.Data;
using System.Xml.Linq;
using static Middlewares.Constant.StatusConstant;
using static performance_server.Controllers.ResignationsController;

namespace performance_server.Service
{
    public class PromotionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly IServiceProvider _serviceProvider;
        public PromotionService(IServiceProvider serviceProvider, ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
        {
            _serviceProvider = serviceProvider;
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;
        }

        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public class PromotionDto
        {
            public int PromotionId { get; set; }
            public decimal EmployeeId { get; set; }
            public string? EmployeeName { get; set; }
            public int DesignationFromId { get; set; }
            public string? DesignationFrom { get; set; }
            public int DepartmentFromId { get; set; }
            public string? DepartmentFrom { get; set; }
            public int DesignationToId { get; set; }
            public string? DesignationTo { get; set; }
            public int DepartmentToId { get; set; }
            public string? DepartmentTo { get; set; }
            public DateTime PromotionDate { get; set; }
            public decimal OldSalary { get; set; }
            public decimal NewSalary { get; set; }
            public string? Status { get; set; }
            public decimal ApproverId { get; set; }
            public string? ApproverName { get; set; }
            public DateTime? ApprovalDate { get; set; }
            public string? Comments { get; set; }
            public string? ApprovedByImgPath { get; set; }
            public string? ImgPath { get; set; }
        }
        public async Task<ApiResponse<PromotionDto>> GetPromotionsAsync()
        {
            try
            {
                var httpContext = _httpContextAccessor.HttpContext;
                var scheme = httpContext?.Request.Scheme;
                var host = httpContext?.Request.Host.Value;
                var promotions = await (from p in _context.Promotions
                                        join e in _context.Employees on p.EmployeeId equals e.Id
                                        join designationFrom in _context.Designations on p.DesignationFromId equals designationFrom.DesignationId into designationFromJoin
                                        from designationFrom in designationFromJoin.DefaultIfEmpty() // Left join for Designation From
                                        join departmentFrom in _context.Departments on p.DepartmentFromId equals departmentFrom.DepartmentId into departmentFromJoin
                                        from departmentFrom in departmentFromJoin.DefaultIfEmpty() // Left join for Department From
                                        join designationTo in _context.Designations on p.DesignationToId equals designationTo.DesignationId into designationToJoin
                                        from designationTo in designationToJoin.DefaultIfEmpty() // Left join for Designation To
                                        join departmentTo in _context.Departments on p.DepartmentToId equals departmentTo.DepartmentId into departmentToJoin
                                        from departmentTo in departmentToJoin.DefaultIfEmpty() // Left join for Department To
                                        join approver in _context.Employees on p.ApproverId equals approver.Id into approverJoin
                                        from approver in approverJoin.DefaultIfEmpty() // Left join for Approver (Employee)
                                        join employment in _context.Employments on p.EmployeeId equals employment.EmployeeId into employmentJoin
                                        from employment in employmentJoin.DefaultIfEmpty() // Left join for Employment (Old Salary)
                                        select new PromotionDto
                                        {
                                            PromotionId = p.PromotionId,
                                            EmployeeId = p.EmployeeId,
                                            EmployeeName = e.FirstNameEn + ' '+ e.LastNameEn, // assuming EmployeeName exists
                                            DesignationFromId = p.DesignationFromId,
                                            DesignationFrom = designationFrom.DesignationNameEn ?? null,
                                            DepartmentFromId = p.DepartmentFromId,
                                            DepartmentFrom = departmentFrom.DepartmentNameEn ?? null,
                                            DesignationToId = p.DesignationToId,
                                            DesignationTo = designationTo.DesignationNameEn ?? null,
                                            DepartmentToId = p.DepartmentToId,
                                            DepartmentTo = departmentTo.DepartmentNameEn ?? null,
                                            PromotionDate = p.PromotionDate,
                                            OldSalary = employment.Salary, // Get old salary from Employment
                                            NewSalary = p.NewSalary,
                                            Status = p.Status,
                                            ApproverId = p.ApproverId,
                                            ApproverName = approver.FirstNameEn + ' ' +approver.LastNameEn  ?? null, // Approver's name
                                            ApprovalDate =p.ApprovalDate,
                                            Comments = p.Comments,
                                            ApprovedByImgPath = approver != null && !string.IsNullOrEmpty(approver.ImgPath)
                                            ? approver.ImgPath
                                            : null,
                                            ImgPath = !string.IsNullOrEmpty(e.ImgPath)
                                            ? e.ImgPath
                                            : null
                                        }).ToListAsync();

                return new ApiResponse<PromotionDto>
                {
                    Data = promotions,
                    TotalData = promotions.Count
                };
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "PromotionService", "Username");
                throw;
            }
        }

        public async Task<bool> CreateOrUpdatePromotion(UpdatePromotionDto promotion)
        {
            var refId = await _context.ApprovalReferences
                            .Where(r => EF.Functions.ILike(r.RefType, "promotion"))
                            .Select(r => r.RefId)
                            .FirstOrDefaultAsync();

            if (promotion.PromotionId > 0)
            {
                // Update existing promotion
                var existingPromotion = await _context.Promotions
                    .FirstOrDefaultAsync(p => p.PromotionId == promotion.PromotionId);

                if (existingPromotion == null)
                {
                    throw new KeyNotFoundException($"Promotion with ID {promotion.PromotionId} not found.");
                }

                // Update promotion fields
                existingPromotion.EmployeeId = promotion.EmployeeId;
                existingPromotion.DesignationFromId = promotion.DesignationFrom;
                existingPromotion.DesignationToId = promotion.DesignationTo;
                existingPromotion.DepartmentFromId = promotion.DepartmentFrom;
                existingPromotion.DepartmentToId = promotion.DepartmentTo;
                existingPromotion.PromotionDate = promotion.PromotionDate.ToUniversalTime();
                existingPromotion.OldSalary = promotion.OldSalary;
                existingPromotion.NewSalary = promotion.NewSalary;
                existingPromotion.UpdateDate = DateTime.UtcNow;
                existingPromotion.CreateDate = ConvertToUtc(existingPromotion.CreateDate);
                existingPromotion.UpdateBy = promotion.Username;
                existingPromotion.RefId = refId;

                _context.Promotions.Update(existingPromotion);

                var existingStatus = await _context.ApprovalStatuses
                   .FirstOrDefaultAsync(s => s.RefType == "promotion" && s.RefRequestId == promotion.PromotionId);

                if (existingStatus != null)
                {
                    existingStatus.UpdateDate = DateTime.UtcNow;
                    existingStatus.UpdateBy = promotion.Username;
                    existingStatus.Status = LeaveRequestStatus.New.ToString(); // หรือ Pending
                    _context.ApprovalStatuses.Update(existingStatus);
                }
            }
            else
            {
                var promotionId = await _context.Promotions
                        .MaxAsync(r => (int?)r.PromotionId) ?? 0;
                promotionId = promotionId + 1;
                // Create new promotion
                var newPromotion = new Promotion
                {
                    PromotionId = promotionId,
                    EmployeeId = promotion.EmployeeId,
                    DesignationFromId = promotion.DesignationFrom,
                    DesignationToId = promotion.DesignationTo,
                    DepartmentFromId = promotion.DepartmentFrom,
                    DepartmentToId = promotion.DepartmentTo,
                    PromotionDate = promotion.PromotionDate.ToUniversalTime(),
                    OldSalary = promotion.OldSalary,
                    NewSalary = promotion.NewSalary,
                    Status = LeaveRequestStatus.New.ToString(),
                    CreateDate = DateTime.UtcNow,
                    CreateBy = promotion.Username,
                    CurrentApprovalLevel = 1,
                    RefId = refId
                };

                var ruleId = await _context.ApprovalSteps
                      .Where(s => s.RefId == refId && s.StepOrder == 1)
                      .Select(s => s.RuleId)
                      .FirstOrDefaultAsync();
                var status = new ApprovalStatus
                {
                    RefType = "promotion",
                    RefId = refId,
                    RefRequestId = (int)promotionId,
                    Status = LeaveRequestStatus.New.ToString(),
                    RequestedBy = (int)promotion.EmployeeId,
                    RequestedAt = DateTime.UtcNow,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = promotion.Username,
                    
                    CurrentStepOrder = 1,
                    RuleId = ruleId
                };

                _context.ApprovalStatuses.Add(status);
                var emp = _context.Employees.Where(e => e.Id == promotion.EmployeeId).FirstOrDefault();
                var designation = _context.Designations.Where(e => e.DesignationId == promotion.DesignationTo).FirstOrDefault();

                var values = new Dictionary<string, string>
                    {
                        { "EmployeeName", emp.FirstNameEn + " " + emp.LastNameEn },
                        { "ProposedPosition", designation.DesignationNameEn },
                        { "ProposedSalary", promotion.NewSalary.ToString() },
                         { "EffectiveDate", promotion.PromotionDate.ToUniversalTime().ToShortDateString() },
                    };

                var languageCode = "en";
                var (subject, message) = await EmailHelper.GetTemplateWithContentAsync(
                                    _serviceProvider,
                                    "PROMOTION_SALARY_INCREASE_REQUEST",
                                    values,
                                    languageCode
                                );

                if (string.IsNullOrWhiteSpace(emp.Email))
                    throw new InvalidOperationException("Employee email not found.");

                if (string.IsNullOrWhiteSpace(subject) || string.IsNullOrWhiteSpace(message))
                    throw new InvalidOperationException("Email template not found or invalid.");

                // ส่งอีเมล
                await EmailHelper.SendEmailBySettingAsync(_serviceProvider, emp.Email, subject, message);
                // var (subject, message) = await _emailService.GetTemplateWithContentAsync("PROMOTION_SALARY_INCREASE_REQUEST", values, languageCode);

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

                _context.Promotions.Add(newPromotion);
            }

            return await _context.SaveChangesAsync() > 0;
        } 
        public class UpdatePromotionDto
        {
            public int PromotionId { get; set; } // Ensure to identify which promotion to update
            public decimal EmployeeId { get; set; }
            public int DesignationFrom { get; set; }
            public int DepartmentFrom { get; set; }
            public int DesignationTo { get; set; }
            public int DepartmentTo { get; set; }
            public DateTime PromotionDate { get; set; }
            public decimal OldSalary { get; set; }
            public decimal NewSalary { get; set; }
            public string Username { get; set; }
            public decimal ApproverId { get; set; }
        }
        public async Task<object> UpdatePromotionStatusAsync(decimal id, ApproveRequest request, string currentUser)
        {
            var promotion = await _context.Promotions.Where(e=> e.PromotionId == id).FirstOrDefaultAsync();
            if (promotion == null)
            {
                throw new Exception("Promotion not found.");
            }

            // Update Promotion
            UpdatePromotionDetails(promotion, request, currentUser);

            // If Approved, Update Employee Details
            if (request.Status.ToString().Equals(LeaveRequestStatus.Approved.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                await UpdateEmployeeOnPromotionAsync(promotion.EmployeeId, promotion, currentUser);
                await UpdateEmploymentOnPromotionAsync(promotion.EmployeeId, promotion, currentUser);

                var emp = _context.Employees.Where(e => e.Id == promotion.EmployeeId).FirstOrDefault();
                var designation = _context.Designations.Where(e => e.DesignationId == promotion.DesignationToId).FirstOrDefault();
                var values = new Dictionary<string, string>
                    {
                        { "EmployeeName", emp.FirstNameEn + " " + emp.LastNameEn },
                        { "ProposedPosition", designation.DesignationNameEn },
                        { "ProposedSalary", promotion.NewSalary.ToString() },
                    };

                var languageCode = "en";
                var (subject, message) = await EmailHelper.GetTemplateWithContentAsync(
                    _serviceProvider,
                    "PROMOTION_SALARY_INCREASE_APPROVED",
                    values,
                    languageCode
                );

                if (string.IsNullOrWhiteSpace(emp.Email))
                    throw new InvalidOperationException("Employee email not found.");

                if (string.IsNullOrWhiteSpace(subject) || string.IsNullOrWhiteSpace(message))
                    throw new InvalidOperationException("Email template not found or invalid.");

                // ส่งอีเมล
                await EmailHelper.SendEmailBySettingAsync(_serviceProvider, emp.Email, subject, message);
                // var (subject, message) = await _emailService.GetTemplateWithContentAsync("PROMOTION_SALARY_INCREASE_APPROVED", values, languageCode);

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

            return promotion;
        }
        private async Task UpdateEmploymentOnPromotionAsync(decimal employeeId, Promotion promotion, string currentUser)
        {
            var employment = await _context.Employments
                .FirstOrDefaultAsync(e => e.EmployeeId == employeeId);

            if (employment == null)
            {
                // Create new Employment record
                var newEmployment = new Employment
                {
                    EmployeeId = employeeId,
                    DesignationId = promotion.DesignationToId,
                    Salary = promotion.NewSalary,
                    EffectiveDate = DateTime.UtcNow,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = currentUser
                };

                _context.Employments.Add(newEmployment);
            }
            else
            {
                // Update existing Employment record
                employment.DesignationId = promotion.DesignationToId;
                employment.Salary = promotion.NewSalary;
                employment.EffectiveDate = DateTime.UtcNow;
                employment.UpdateDate = DateTime.UtcNow;
                employment.UpdateBy = currentUser;
                employment.CreateDate = ConvertToUtc(employment.CreateDate);
                _context.Employments.Update(employment);
            }
        }

        private void UpdatePromotionDetails(Promotion promotion, ApproveRequest request, string currentUser)
        {
            promotion.Status = request.Status.ToString();
            promotion.Comments = request.Comments;
            promotion.UpdateDate = DateTime.UtcNow;
            promotion.UpdateBy = currentUser;
            promotion.ApproverId = request.ApproverId;
            promotion.ApprovalDate = DateTime.UtcNow;
            promotion.CreateDate = ConvertToUtc(promotion.CreateDate);
            promotion.PromotionDate = promotion.PromotionDate.ToUniversalTime();
            _context.Promotions.Update(promotion);
        }

        private async Task UpdateEmployeeOnPromotionAsync(decimal employeeId, Promotion promotion, string currentUser)
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                throw new Exception("Employee not found.");
            }

            employee.DesignationId = promotion.DesignationToId;
            employee.DepartmentId = promotion.DepartmentToId;
            employee.UpdateDate = DateTime.UtcNow;
            employee.UpdateBy = currentUser;

            // Ensure all date fields are in UTC
            employee.CreateDate = ConvertToUtc(employee.CreateDate);
            employee.BirthDate = ConvertToUtc(employee.BirthDate);
            employee.JoinDate = ConvertToUtc(employee.JoinDate);
            employee.PassportExpiryDate = ConvertToUtc(employee.PassportExpiryDate);

            _context.Employees.Update(employee);
        }

        private DateTime? ConvertToUtc(DateTime? date)
        {
            return date.HasValue ? date.Value.ToUniversalTime() : (DateTime?)null;
        }
        public async Task<int> GetPendingApprovalCountInternalAsync()
        {
            // Count the number of pending requests
            return await _context.Promotions
                .CountAsync(o => o.Status == LeaveRequestStatus.New.ToString());
        }
        public class ApproveRequest
        {
            public string Username { get; set; }
            public decimal ApproverId { get; set; }
            public LeaveRequestStatus Status { get; set; }
            public string Comments { get; set; }
        }
    }
}

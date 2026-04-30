using AutoMapper;
using Azure.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Helpers;
using Middlewares.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.Xml.Linq;
using static Middlewares.Constant.StatusConstant;

namespace performance_server.Service
{
    public class TerminationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly IServiceProvider _serviceProvider;
        public TerminationService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor, IServiceProvider serviceProvider)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;
            _serviceProvider = serviceProvider;
        }

        public class TerminateDto
        {
            public int TerminateId { get; set; }
            public int TerminateTypeId { get; set; }
            public string? TerminateTypeName{ get; set; }
            public decimal EmployeeId { get; set; }
            public string? EmployeeName { get; set; }
            public int? DesignationId { get; set; }
            public string? DesignationName { get; set; }
            public DateTime? NoticeDate { get; set; }
            public DateTime? TerminateDate { get; set; }
            public string? Reason { get; set; }
            public DateTime? CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public DateTime? UpdateDate { get; set; }
            public string? UpdateBy { get; set; }
            public string? ImgPath { get; set; }
        }
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }


        public async Task<ApiResponse<TerminateDto>> GetTerminationsAsync()
        {
            try
            {
                var httpContext = _httpContextAccessor.HttpContext;
                var scheme = httpContext?.Request.Scheme;
                var host = httpContext?.Request.Host.Value;

                var terminations = await (from t in _context.Terminates
                                          join e in _context.Employees on t.EmployeeId equals e.Id
                                          join terminateType in _context.TerminateTypes on t.TerminateTypeId equals terminateType.TerminateTypeId into terminateTypeJoin
                                          from terminateType in terminateTypeJoin.DefaultIfEmpty() // Left join for Terminate Type
                                          join designation in _context.Designations on e.DesignationId equals designation.DesignationId into designationJoin
                                          from designation in designationJoin.DefaultIfEmpty() // Left join for Designation
                                          select new TerminateDto
                                          {
                                              TerminateId = t.TerminateId,
                                              TerminateTypeId = t.TerminateTypeId,
                                              TerminateTypeName = terminateType.TerminateTypeNameEn ?? null,
                                              EmployeeId = t.EmployeeId,
                                              EmployeeName = e.FirstNameEn + ' ' + e.LastNameEn, // assuming EmployeeName exists
                                              DesignationId = e.DesignationId,
                                              DesignationName = designation.DesignationNameEn ?? null,
                                              NoticeDate = t.NoticeDate,
                                              TerminateDate = t.TerminateDate,
                                              Reason = t.Reason,
                                              CreateDate = t.CreateDate,
                                              CreateBy = t.CreateBy,
                                              UpdateDate = t.UpdateDate,
                                              ImgPath = string.IsNullOrEmpty(e.ImgPath)
                                              ? null
                                              : e.ImgPath,
                                              UpdateBy = t.UpdateBy
                                          }).ToListAsync();

                return new ApiResponse<TerminateDto>
                {
                    Data = terminations,
                    TotalData = terminations.Count
                };
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "TerminateService", "Username");
                throw;
            }
        }

        public class TerminateTypeDTO
        {
            public string? Username { get; set; }
            public int TerminateTypeId { get; set; }
            public string? TerminateTypeNameTh { get; set; }
            public string? TerminateTypeNameEn { get; set; }
            public string? TerminateTypeCode { get; set; }
        }

        public async Task<string> CreateOrUpdateTerminateTypeAsync(TerminateTypeDTO terminateTypeDto)
        {
            var utcDateTime = DateTime.UtcNow;

            if (terminateTypeDto.TerminateTypeId > 0)
            {
                // Update existing terminate type
                var existingTerminateType = await _context.TerminateTypes
                    .FirstOrDefaultAsync(e => e.TerminateTypeId == terminateTypeDto.TerminateTypeId);

                if (existingTerminateType == null)
                {
                    throw new KeyNotFoundException($"TerminateType with ID {terminateTypeDto.TerminateTypeId} not found.");
                }

                existingTerminateType.UpdateBy = terminateTypeDto.Username;
                existingTerminateType.UpdateDate = utcDateTime;
                existingTerminateType.TerminateTypeNameEn = terminateTypeDto.TerminateTypeNameEn;
                existingTerminateType.TerminateTypeNameTh = terminateTypeDto.TerminateTypeNameTh;
                existingTerminateType.TerminateTypeCode = terminateTypeDto.TerminateTypeCode;

                _context.TerminateTypes.Update(existingTerminateType);
            }
            else
            {
                // Add new terminate type
                var maxId = await _context.TerminateTypes.MaxAsync(e => (int?)e.TerminateTypeId) ?? 0;
                var newTerminateType = new TerminateType
                {
                    TerminateTypeId = maxId + 1,
                    TerminateTypeNameTh = terminateTypeDto.TerminateTypeNameTh,
                    TerminateTypeNameEn = terminateTypeDto.TerminateTypeNameEn,
                    TerminateTypeCode = terminateTypeDto.TerminateTypeCode,
                    CreateDate = utcDateTime,
                    CreateBy = terminateTypeDto.Username,
                    IsActive = true
                };

                _context.TerminateTypes.Add(newTerminateType);
            }

            await _context.SaveChangesAsync();
            return "TerminateType saved successfully.";
        }

        public class TerminateDTO
        {
            public int TerminateId { get; set; }
            public int TerminateTypeId { get; set; }
            public decimal EmployeeId { get; set; }
            public DateTime? NoticeDate { get; set; }
            public DateTime? TerminateDate { get; set; }
            public string? Reason { get; set; }
            public string? Username { get; set; }
        }
        public async Task<bool> SaveTerminateAsync(TerminateDTO terminateDto)
        {
            if (terminateDto == null)
                throw new ArgumentNullException(nameof(terminateDto), "TerminateDto cannot be null.");

            var refId = await _context.ApprovalReferences
                .Where(r => EF.Functions.ILike(r.RefType, "termination"))
                .Select(r => r.RefId)
                .FirstOrDefaultAsync();

            if (terminateDto.TerminateId > 0)
            {
                // Update existing terminate
                var existingTerminate = await _context.Terminates
                    .FirstOrDefaultAsync(t => t.TerminateId == terminateDto.TerminateId);

                if (existingTerminate == null)
                    throw new KeyNotFoundException($"Terminate with ID {terminateDto.TerminateId} not found.");

                existingTerminate.TerminateTypeId = terminateDto.TerminateTypeId;
                existingTerminate.EmployeeId = terminateDto.EmployeeId;
                existingTerminate.NoticeDate = terminateDto.NoticeDate?.ToUniversalTime();
                existingTerminate.TerminateDate = terminateDto.TerminateDate?.ToUniversalTime();
                existingTerminate.Reason = terminateDto.Reason;
                existingTerminate.UpdateDate = DateTime.UtcNow;
                existingTerminate.UpdateBy = terminateDto.Username;
                existingTerminate.RefId = refId;

                _context.Terminates.Update(existingTerminate);
            }
            else
            {
                // Create new terminate
                var newTerminate = new Terminate
                {
                    TerminateTypeId = terminateDto.TerminateTypeId,
                    EmployeeId = terminateDto.EmployeeId,
                    NoticeDate = terminateDto.NoticeDate?.ToUniversalTime(),
                    TerminateDate = terminateDto.TerminateDate?.ToUniversalTime(),
                    Reason = terminateDto.Reason,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = terminateDto.Username,
                    UpdateDate = DateTime.UtcNow,
                    UpdateBy = terminateDto.Username,
                    RefId = refId
                };

                _context.Terminates.Add(newTerminate);
            }

            // ดึงข้อมูล employee + termination type
            var emp = await _context.Employees.FirstOrDefaultAsync(e => e.Id == terminateDto.EmployeeId);
            var type = await _context.TerminateTypes.FirstOrDefaultAsync(t => t.TerminateTypeId == terminateDto.TerminateTypeId);

            if (emp == null || type == null)
                throw new KeyNotFoundException("Employee or Termination Type not found.");

            var values = new Dictionary<string, string>
                        {
                            { "EmployeeName", emp.FirstNameEn + " " + emp.LastNameEn },
                            { "TerminationDate", terminateDto.TerminateDate?.ToString("yyyy-MM-dd") ?? "" },
                            { "TerminationType", type.TerminateTypeNameEn },
                            { "Reason", terminateDto.Reason ?? "" },
                        };

            var languageCode = "en";

            // ดึง template และแทนค่า
            var (subject, message) = await EmailHelper.GetTemplateWithContentAsync(
                _serviceProvider,
                "TERMINATION_NOTIFICATION",
                values,
                languageCode
            );

            if (string.IsNullOrWhiteSpace(emp.Email))
                throw new InvalidOperationException("Employee email not found.");

            if (string.IsNullOrWhiteSpace(subject) || string.IsNullOrWhiteSpace(message))
                throw new InvalidOperationException("Email template not found or invalid.");

            // ส่งอีเมล
            await EmailHelper.SendEmailBySettingAsync(_serviceProvider, emp.Email, subject, message);

            // บันทึกการเปลี่ยนแปลง
            return await _context.SaveChangesAsync() > 0;
        }

    }
}

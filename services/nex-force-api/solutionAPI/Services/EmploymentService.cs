using AutoMapper;
using Consul;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using static Middlewares.Constant.StatusConstant;


namespace solutionAPI.Services
{
    public class EmploymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILoggingService _loggingService;

        public EmploymentService(ApplicationDbContext context, ILoggingService loggingService)
        {
            _context = context;
            _loggingService = loggingService;
        }
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        public class EmploymentDto
        {
            public int EmploymentId { get; set; }
            public decimal EmployeeId { get; set; }
            public decimal Salary { get; set; }
            public DateTime? EffectiveDate { get; set; }
            public string DesignationName { get; set; }
            public string? PaymentTypeNameEn { get; set; }
            public string? EmployeeTypeNameEn { get; set; }
            public int? EmployeeTypeId { get; set; }
            public int? PaymentTypeId { get; set; }
            public string DepartmentName { get; set; }
        }
        public class EmploymentHistoryDto
        {
            public int HistoryId { get; set; }
            public int EmploymentId { get; set; }
            public DateTime EffectiveDateStart { get; set; }
            public DateTime EffectiveDateEnd { get; set; }
            public string DesignationName { get; set; }
            public string DepartmentName { get; set; }
            public decimal Salary { get; set; }
            public int? EmployeeTypeId { get; set; }
            public string? PaymentTypeNameEn { get; set; }
            public string? EmployeeTypeNameEn { get; set; }
            public int? PaymentTypeId { get; set; }
        }

        public async Task<EmploymentDto> GetEmploymentsAsync(decimal employeeId)
        {
            try
            {
                var employments = await (from e in _context.Employments
                                         join d in _context.Designations
                                            on e.DesignationId equals d.DesignationId into dJoin
                                         from d in dJoin.DefaultIfEmpty()
                                         join dept in _context.Departments on d.DepartmentId equals dept.DepartmentId into deptJoin
                                         from dept in deptJoin.DefaultIfEmpty()
                                         join et in _context.EmployeeTypes on e.EmployeeTypeId equals et.EmployeeTypeId into etJoin
                                         from et in etJoin.DefaultIfEmpty()
                                         join pt in _context.PaymentTypes on e.PaymentTypeId equals pt.PaymentTypeId into ptJoin
                                         from pt in ptJoin.DefaultIfEmpty()

                                         where e.EmployeeId == employeeId
                                         select new EmploymentDto
                                         {
                                             EmploymentId = e.EmploymentId,
                                             EmployeeId = e.EmployeeId,
                                             Salary = e.Salary,
                                             EffectiveDate = e.EffectiveDate,
                                             DesignationName = d.DesignationNameTh,
                                             DepartmentName = dept != null ? dept.DepartmentNameTh : null,
                                             PaymentTypeId = e.PaymentTypeId,
                                             PaymentTypeNameEn = pt != null ? pt.PaymentTypeNameEn : null,
                                             EmployeeTypeId = e.EmployeeTypeId,
                                             EmployeeTypeNameEn = et != null ? et.EmployeeTypeNameEn : null
                                         }).FirstOrDefaultAsync();

                return employments;
             
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "EmploymentService", "Username");
                throw;
            }
        }

        public async Task<ApiResponse<EmploymentDto>> GetAllEmploymentsAsync()
        {
            try
            {
                var employments = await (from e in _context.Employments
                                         join d in _context.Designations on e.DesignationId equals d.DesignationId
                                         join dept in _context.Departments on d.DepartmentId equals dept.DepartmentId into deptJoin
                                         from dept in deptJoin.DefaultIfEmpty() 
                                         join et in _context.EmployeeTypes on e.EmployeeTypeId equals et.EmployeeTypeId into etJoin
                                         from et in etJoin.DefaultIfEmpty() 
                                         join pt in _context.PaymentTypes on e.PaymentTypeId equals pt.PaymentTypeId into ptJoin
                                         from pt in ptJoin.DefaultIfEmpty()
                                         select new EmploymentDto
                                         {
                                             EmploymentId = e.EmploymentId,
                                             EmployeeId = e.EmployeeId,
                                             Salary = e.Salary,
                                             EffectiveDate = e.EffectiveDate,
                                             DesignationName = d.DesignationNameTh,
                                             DepartmentName = dept != null ? dept.DepartmentNameTh : null,
                                             PaymentTypeId = e.PaymentTypeId,
                                             PaymentTypeNameEn = pt != null ? pt.PaymentTypeNameEn : null,
                                             EmployeeTypeId = e.EmployeeTypeId,
                                             EmployeeTypeNameEn = et != null ? et.EmployeeTypeNameEn : null
                                         }).ToListAsync();


                return new ApiResponse<EmploymentDto>
                {
                    Data = employments,
                    TotalData = employments.Count
                };

            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "EmploymentService", "Username");
                throw;
            }
        }

        public async Task<ApiResponse<EmploymentHistoryDto>> GetEmploymentHistoryAsync(decimal employeeId)
        {
            try
            {
                var employmentHistory = await (from e in _context.EmploymentHistorys
                                               join emp in _context.Employments on e.EmploymentId equals emp.EmploymentId
                                               join d in _context.Designations on emp.DesignationId equals d.DesignationId
                                               join dept in _context.Departments on d.DepartmentId equals dept.DepartmentId into deptJoin
                                               from dept in deptJoin.DefaultIfEmpty() // Left join for departments
                                               join et in _context.EmployeeTypes on e.EmployeeTypeId equals et.EmployeeTypeId into etJoin
                                               from et in etJoin.DefaultIfEmpty() // Left join for EmployeeTypes
                                               join pt in _context.PaymentTypes on e.PaymentTypeId equals pt.PaymentTypeId into ptJoin
                                               from pt in ptJoin.DefaultIfEmpty() // Left join for PaymentTypes
                                               where emp.EmployeeId == employeeId
                                               select new EmploymentHistoryDto
                                               {
                                                   HistoryId = e.HistoryId,
                                                   EmploymentId = e.EmploymentId,
                                                   EffectiveDateStart = e.EffectiveDateStart,
                                                   Salary = e.Salary,
                                                   EffectiveDateEnd = e.EffectiveDateEnd,
                                                   DesignationName = d.DesignationNameTh,
                                                   DepartmentName = dept != null ? dept.DepartmentNameTh : "N/A",
                                                   PaymentTypeId = e.PaymentTypeId,
                                                   PaymentTypeNameEn = pt != null ? pt.PaymentTypeNameEn : null,
                                                   EmployeeTypeId = e.EmployeeTypeId,
                                                   EmployeeTypeNameEn = et != null ? et.EmployeeTypeNameEn : null
                                               }).ToListAsync();

                return new ApiResponse<EmploymentHistoryDto>
                {
                    Data = employmentHistory,
                    TotalData = employmentHistory.Count
                };
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.Message, "EmploymentHistoryService", "Username");
                throw;
            }
        }
    }
}

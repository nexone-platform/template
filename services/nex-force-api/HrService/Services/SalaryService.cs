using Microsoft.AspNetCore.SignalR.Protocol;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Helpers;
using Middlewares.Models;
using System;
using System.Linq;
using static HrService.Controllers.SalaryController;
using static HrService.Services.PayrollService;
using static Middlewares.Constant.StatusConstant;

namespace HrService.Services
{
    public class SalaryService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly IServiceProvider _serviceProvider;
        public SalaryService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor, IServiceProvider serviceProvider   )
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;
            _serviceProvider = serviceProvider;
        }

        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        public class ServiceResponse
        {
            public bool IsSuccess { get; set; }
            public string Message { get; set; }
            public int? PeriodId { get; set; }
        }
        public async Task<ApiResponse<EmployeePaymentDto>> GetEmployeesByPaymentTypeAsync(int paymentTypeId)
        {
            var employees = await (from emp in _context.Employees
                                   join em in _context.Employments
                                   on emp.Id equals em.EmployeeId into employment
                                   from em in employment.DefaultIfEmpty()
                                   join et in _context.EmployeeTypes on em.EmployeeTypeId equals et.EmployeeTypeId into etJoin
                                   from et in etJoin.DefaultIfEmpty()
                                   join pt in _context.PaymentTypes on em.PaymentTypeId equals pt.PaymentTypeId into ptJoin
                                   from pt in ptJoin.DefaultIfEmpty()
                                   join ds in _context.Designations on em.DesignationId equals ds.DesignationId into dsJoin
                                   from ds in dsJoin.DefaultIfEmpty()
                                   join dm in _context.Departments on ds.DepartmentId equals dm.DepartmentId into dmJoin
                                   from dm in dmJoin.DefaultIfEmpty()
                                   where em.PaymentTypeId == paymentTypeId
                                   select new EmployeePaymentDto
                                   {
                                       Id = emp.Id,
                                       FirstNameEn = emp.FirstNameEn,
                                       LastNameEn = emp.LastNameEn,
                                       Email = emp.Email,
                                       IsActive = emp.IsActive,
                                       Salary = em.Salary,
                                       EffectiveDate = em.EffectiveDate,
                                       PaymentTypeId = em.PaymentTypeId,
                                       PaymentTypeName = pt.PaymentTypeNameEn,
                                       EmployeeType = em.EmployeeTypeId,
                                       BankAccountNo = emp.BankAccountNo,
                                       EmployeeTypeName = et.EmployeeTypeNameEn,
                                       DepartmentName = dm.DepartmentNameEn,
                                       DesignationName = ds.DesignationNameEn,
                                       Deductions = (from da in _context.Deductions
                                                     join asign in _context.DeductionEmployeeAssignments
                                                     on da.DeductionId equals asign.DeductionId
                                                     where asign.EmployeeId == emp.Id
                                                        || _context.Employees
                                                           .Where(e => e.Id == emp.Id)
                                                           .Select(e => e.DepartmentId)
                                                           .Contains(asign.DepartmentId)
                                                     select new DeductionInfo
                                                     {
                                                         DeductionId = da.DeductionId,
                                                         DeductionName = da.DeductionName,
                                                         Amount = da.UnitAmount ?? (da.PercentAmount * em.Salary / 100),
                                                         IsPersonal = false
                                                     }).ToList(),
                                       Additions = (from aa in _context.Additions
                                                    join asign in _context.AdditionEmployeeAssignments
                                                    on aa.AdditionsId equals asign.AdditionsId
                                                    where asign.EmployeeId == emp.Id
                                                       || _context.Employees
                                                          .Where(e => e.Id == emp.Id)
                                                          .Select(e => e.DepartmentId)
                                                          .Contains(asign.DepartmentId)
                                                    select new AdditionInfo
                                                    {
                                                        AdditionId = aa.AdditionsId,
                                                        AdditionName = aa.AdditionsName,
                                                        Amount = aa.UnitAmount ?? (aa.PercentAmount * em.Salary / 100),
                                                        IsPersonal = false
                                                    }).ToList(),
                                       TotalDeductions = (from da in _context.Deductions
                                                          join asign in _context.DeductionEmployeeAssignments
                                                          on da.DeductionId equals asign.DeductionId
                                                          where asign.EmployeeId == emp.Id
                                                             || _context.Employees
                                                                .Where(e => e.Id == emp.Id)
                                                                .Select(e => e.DepartmentId)
                                                                .Contains(asign.DepartmentId)
                                                          select da.UnitAmount ?? (da.PercentAmount.GetValueOrDefault(0) * (em.Salary) / 100)).Sum(),
                                       TotalAdditions = (from aa in _context.Additions
                                                         join asign in _context.AdditionEmployeeAssignments
                                                         on aa.AdditionsId equals asign.AdditionsId
                                                         where asign.EmployeeId == emp.Id
                                                            || _context.Employees
                                                               .Where(e => e.Id == emp.Id)
                                                               .Select(e => e.DepartmentId)
                                                               .Contains(asign.DepartmentId)
                                                         select aa.UnitAmount ?? (aa.PercentAmount.GetValueOrDefault(0) * (em.Salary) / 100)).Sum()
                                   }).ToListAsync();

            return new ApiResponse<EmployeePaymentDto>
            {
                Data = employees,
                TotalData = employees.Count
            };
        }
        public async Task<ApiResponse<EmployeeDto>> GetEmployeesAsync()
        {
            var employees = await (from emp in _context.Employees
                                   join em in _context.Employments
                                   on emp.Id equals em.EmployeeId into employment
                                   from em in employment.DefaultIfEmpty()
                                   join et in _context.EmployeeTypes on em.EmployeeTypeId equals et.EmployeeTypeId into etJoin
                                   from et in etJoin.DefaultIfEmpty()
                                   join pt in _context.PaymentTypes on em.PaymentTypeId equals pt.PaymentTypeId into ptJoin
                                   from pt in ptJoin.DefaultIfEmpty()
                                   join ds in _context.Designations on em.DesignationId equals ds.DesignationId into dsJoin
                                   from ds in dsJoin.DefaultIfEmpty()
                                   join dm in _context.Departments on ds.DepartmentId equals dm.DepartmentId into dmJoin
                                   from dm in dmJoin.DefaultIfEmpty()
                                   select new EmployeeDto
                                   {
                                       Id = emp.Id,
                                       FirstNameEn = emp.FirstNameEn,
                                       LastNameEn = emp.LastNameEn,
                                       Email = emp.Email,
                                       IsActive = emp.IsActive,
                                       Salary = em.Salary,
                                       EffectiveDate = em.EffectiveDate,
                                       PaymentTypeId = em.PaymentTypeId,
                                       PaymentTypeName = pt.PaymentTypeNameEn,
                                       EmployeeType = em.EmployeeTypeId,
                                       EmployeeTypeName = et.EmployeeTypeNameEn,
                                       BankAccountNo = emp.BankAccountNo,
                                       DepartmentName = dm.DepartmentNameEn,
                                       DesignationName = ds.DesignationNameEn,
                                       Deductions = (from da in _context.Deductions
                                                     join asign in _context.DeductionEmployeeAssignments
                                                     on da.DeductionId equals asign.DeductionId
                                                     where asign.EmployeeId == emp.Id
                                                        || _context.Employees
                                                           .Where(e => e.Id == emp.Id)
                                                           .Select(e => e.DepartmentId)
                                                           .Contains(asign.DepartmentId)
                                                     select new DeductionInfo
                                                     {
                                                         DeductionId = da.DeductionId,
                                                         DeductionName = da.DeductionName,
                                                         Amount = da.UnitAmount ?? (da.PercentAmount * em.Salary / 100),
                                                         IsPersonal = false
                                                     }).ToList(),
                                       Additions = (from aa in _context.Additions
                                                    join asign in _context.AdditionEmployeeAssignments
                                                    on aa.AdditionsId equals asign.AdditionsId
                                                    where asign.EmployeeId == emp.Id
                                                       || _context.Employees
                                                          .Where(e => e.Id == emp.Id)
                                                          .Select(e => e.DepartmentId)
                                                          .Contains(asign.DepartmentId)
                                                    select new AdditionInfo
                                                    {
                                                        AdditionId = aa.AdditionsId,
                                                        AdditionName = aa.AdditionsName,
                                                        Amount = aa.UnitAmount ?? (aa.PercentAmount * em.Salary / 100),
                                                        IsPersonal = false
                                                    }).ToList(),
                                       TotalDeductions = (from da in _context.Deductions
                                                          join asign in _context.DeductionEmployeeAssignments
                                                          on da.DeductionId equals asign.DeductionId
                                                          where asign.EmployeeId == emp.Id
                                                             || _context.Employees
                                                                .Where(e => e.Id == emp.Id)
                                                                .Select(e => e.DepartmentId)
                                                                .Contains(asign.DepartmentId)
                                                          select da.UnitAmount ?? (da.PercentAmount.GetValueOrDefault(0) * (em.Salary) / 100)).Sum(),
                                       TotalAdditions = (from aa in _context.Additions
                                                         join asign in _context.AdditionEmployeeAssignments
                                                         on aa.AdditionsId equals asign.AdditionsId
                                                         where asign.EmployeeId == emp.Id
                                                            || _context.Employees
                                                               .Where(e => e.Id == emp.Id)
                                                               .Select(e => e.DepartmentId)
                                                               .Contains(asign.DepartmentId)
                                                         select aa.UnitAmount ?? (aa.PercentAmount.GetValueOrDefault(0) * (em.Salary) / 100)).Sum()
                                   }).ToListAsync();


 
            return new ApiResponse<EmployeeDto>
            {
                Data = employees,
                TotalData = employees.Count
            };
        }

        public class PeriodPayrollDto
        {
            public int PeriodId { get; set; }
            public DateTime? PeriodStartDate { get; set; }
            public DateTime? PeriodEndDate { get; set; }
            public DateTime? MonthYear { get; set; }
            public DateTime? CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public DateTime? UpdateDate { get; set; }
            public string? UpdateBy { get; set; }
            public decimal? TotalCost { get; set; }
            public decimal? TotalPayment { get; set; }
            public string? Status { get; set; }
            public DateTime? PaymentDate { get; set; }
            public PaymentChannel? PaymentChannel { get; set; }
            public string? Reason { get; set; }
            public int? PaymentTypeId { get; set; }
        }

        public async Task<List<PeriodPayrollDto>> GetAllPeriodsAsync()
        {
            return await _context.PeriodPayrolls
              .OrderByDescending(p => p.PeriodEndDate)
              .Select(p => new PeriodPayrollDto
              {
                  PeriodId = p.PeriodId,
                  PeriodStartDate = p.PeriodStartDate,
                  PeriodEndDate = p.PeriodEndDate,
                  MonthYear = p.MonthYear,
                  CreateDate = p.CreateDate,
                  CreateBy = p.CreateBy,
                  UpdateDate = p.UpdateDate,
                  UpdateBy = p.UpdateBy,
                  TotalCost = p.TotalCost,
                  TotalPayment = p.TotalPayment,
                  Status = ((PeriodStatus)p.Status).ToString(),
                  PaymentDate = p.PaymentDate,
                  PaymentTypeId = p.PaymentTypeId,
                  PaymentChannel = p.PaymentChannel
              })
              .ToListAsync();
        }
        public async Task<List<PeriodPayrollDto>> GetPeriodsAsync(PeriodStatusRequest request)
        {
            var query = _context.PeriodPayrolls.AsQueryable();

            // Apply Status filter if provided
            if (request.Status.HasValue)
            {
                query = query.Where(p => (int?)p.Status == request.Status.Value);
            }

            // Apply Month filter if provided
            if (request.Month.HasValue)
            {
                query = query.Where(p => p.MonthYear.Value.Year == request.Month.Value.Year &&
                                         p.MonthYear.Value.Month == request.Month.Value.Month);
            }

            // Execute query and map to DTO
            return await query
                .OrderByDescending(p => p.PeriodEndDate)
                .Select(p => new PeriodPayrollDto
                {
                    PeriodId = p.PeriodId,
                    PeriodStartDate = p.PeriodStartDate,
                    PeriodEndDate = p.PeriodEndDate,
                    MonthYear = p.MonthYear,
                    CreateDate = p.CreateDate,
                    CreateBy = p.CreateBy,
                    UpdateDate = p.UpdateDate,
                    UpdateBy = p.UpdateBy,
                    TotalCost = p.TotalCost,
                    TotalPayment = p.TotalPayment,
                    Status = ((PeriodStatus)p.Status).ToString(),
                    PaymentDate = p.PaymentDate,
                    PaymentTypeId = p.PaymentTypeId,
                    PaymentChannel = p.PaymentChannel,
                    Reason = p.Reason
                })
                .ToListAsync();
        }
        public async Task<List<SocialSecurityRate>> GetAllSocialSecurityRateAsync()
        {
            return await _context.SocialSecurityRates.ToListAsync();
        }
        // Fetch payroll data by periodId
        public async Task<List<Payroll>> GetPayrollByPeriodIdAsync(int periodId)
        {
            return await _context.Payrolls
                .Where(p => p.PeriodId == periodId)
                .ToListAsync();
        }

        public async Task<ServiceResponse> CreatePayrollAsync(ApiRequest request)
        {
            if (request == null || request.TransactionData == null || request.EmployeeData == null)
            {
                return new ServiceResponse { IsSuccess = false, Message = "Invalid request data." };
            }

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var status = (request.TransactionData.Status ?? PeriodStatus.Draft);

                    // Step 1: Insert into Period table
                    var period = new PeriodPayroll
                    {
                        PeriodStartDate = request.TransactionData.StartDate ?? DateTime.Now,
                        PeriodEndDate = request.TransactionData.EndDate ?? DateTime.Now,
                        MonthYear = request.TransactionData.StartDate ?? DateTime.Now,
                        CreateBy = "System",
                        CreateDate = DateTime.UtcNow,
                        Status = status,
                        PaymentDate = request.TransactionData.PaymentDate,
                        TotalPayment = request.TransactionData.Summary?.NetPayment,
                        TotalCost = request.TransactionData.Summary?.TotalCost,
                        PaymentChannel = request.TransactionData.PaymentChannel,
                        PaymentTypeId = request.TransactionData.PaymentTypeId,
                    };

                    _context.PeriodPayrolls.Add(period);
                    await _context.SaveChangesAsync();
                    var periodId = period.PeriodId;

                    // Step 2: Insert into Payroll table
                    foreach (var employee in request.EmployeeData)
                    {
                        var payroll = new Payroll
                        {
                            EmployeeId = employee.Id ?? 0,
                            MonthYear = request.TransactionData.StartDate ?? DateTime.Now,
                            Salary = employee.Salary ?? 0,
                            TotalAdditions = employee.TotalAdditions ?? 0,
                            TotalDeductions = employee.TotalDeductions ?? 0,
                            NetSalary = (employee.TotalPayment ?? 0),
                            CreateBy = "System",
                            CreateDate = DateTime.UtcNow,
                            PeriodId = periodId,
                            PayDate = request.TransactionData.PaymentDate,
                            PaymentStatus = status,
                            SocialSecurity = employee.SocialSecurity ?? 0,
                            Tax401 = employee.Tax401,
                            Tax402 = employee.Tax402,
                            SocialSecurityRate = request.TransactionData.SocialSecurityRate
                        };

                        _context.Payrolls.Add(payroll);
                        await _context.SaveChangesAsync();

                        var payrollId = payroll.PayrollId;

                        // Step 3: Insert into Addition table
                        if (employee.Additions != null)
                        {
                            foreach (var addition in employee.Additions)
                            {
                                var personalAddition = new PersonalAdditional
                                {
                                    EmployeeId = employee.Id ?? 0,
                                    AdditionName = addition.AdditionName,
                                    AdditionAmount = addition.Amount ?? 0,
                                    AdditionDate = DateTime.UtcNow,
                                    MonthYear = request.TransactionData.StartDate ?? DateTime.Now,
                                    IsActive = true,
                                    CreateBy = "System",
                                    CreateDate = DateTime.UtcNow,
                                    AdditionType = addition.Type,
                                    PayrollId = payrollId
                                };

                                _context.PersonalAdditionals.Add(personalAddition);
                            }

                            await _context.SaveChangesAsync();
                        }

                        // Step 4: Insert into Deduction table
                        if (employee.Deductions != null)
                        {
                            foreach (var deduction in employee.Deductions)
                            {
                                var personalDeduction = new PersonalDeduction
                                {
                                    EmployeeId = employee.Id ?? 0,
                                    DeductionName = deduction.DeductionName,
                                    DeductionAmount = deduction.Amount ?? 0,
                                    DeductionDate = DateTime.UtcNow,
                                    MonthYear = request.TransactionData.StartDate ?? DateTime.Now,
                                    IsActive = true,
                                    CreateBy = "System",
                                    CreateDate = DateTime.UtcNow,
                                    DeductionType = deduction.Type,
                                    PayrollId = payrollId
                                };

                                _context.PersonalDeductions.Add(personalDeduction);
                            }

                            await _context.SaveChangesAsync();
                        }
                    }

                    await transaction.CommitAsync();

                    return new ServiceResponse
                    {
                        IsSuccess = true,
                        Message = "Payroll created successfully.",
                        PeriodId = periodId
                    };
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new ServiceResponse { IsSuccess = false, Message = $"Error: {ex.Message}" };
                }
            }
        }
        public async Task<ServiceResponse> UpdatePayrollAsync(ApiRequest request)
        {
            if (request == null || request.TransactionData == null || request.EmployeeData == null)
            {
                return new ServiceResponse { IsSuccess = false, Message = "Invalid request data." };
            }

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Find existing PeriodPayroll
                    var existingPeriod = await _context.PeriodPayrolls.FindAsync(request.TransactionData.PeriodId);
                    if (existingPeriod == null)
                    {
                        return new ServiceResponse { IsSuccess = false, Message = "Period not found." };
                    }

                    // Update PeriodPayroll
                    existingPeriod.PeriodStartDate = request.TransactionData.StartDate ?? existingPeriod.PeriodStartDate;
                    existingPeriod.PeriodEndDate = request.TransactionData.EndDate ?? existingPeriod.PeriodEndDate;
                    existingPeriod.MonthYear = request.TransactionData.StartDate ?? existingPeriod.MonthYear;
                    existingPeriod.Status = request.TransactionData.Status ?? existingPeriod.Status;
                    existingPeriod.PaymentDate = request.TransactionData.PaymentDate ?? existingPeriod.PaymentDate;
                    existingPeriod.TotalPayment = request.TransactionData.Summary?.NetPayment ?? existingPeriod.TotalPayment;
                    existingPeriod.TotalCost = request.TransactionData.Summary?.TotalCost ?? existingPeriod.TotalCost;
                    existingPeriod.PaymentChannel = request.TransactionData.PaymentChannel ?? existingPeriod.PaymentChannel;
                    existingPeriod.PaymentTypeId = request.TransactionData.PaymentTypeId ?? existingPeriod.PaymentTypeId;

                    await _context.SaveChangesAsync();

                    // Remove old Payroll Details
                    var oldPayrolls = _context.Payrolls.Where(p => p.PeriodId == existingPeriod.PeriodId).ToList();
                    _context.Payrolls.RemoveRange(oldPayrolls);
                    await _context.SaveChangesAsync();

                    // Add updated Payroll Details
                    await AddPayrollDetails(request, existingPeriod.PeriodId);

                    await transaction.CommitAsync();

                    return new ServiceResponse
                    {
                        IsSuccess = true,
                        Message = "Payroll updated successfully.",
                        PeriodId = existingPeriod.PeriodId
                    };
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new ServiceResponse { IsSuccess = false, Message = $"Error: {ex.Message}" };
                }
            }
        }

        private async Task AddPayrollDetails(ApiRequest request, int periodId)
        {
            // Delete existing payrolls and their related additions/deductions
            var existingPayrolls = _context.Payrolls.Where(p => p.PeriodId == periodId).ToList();
            if (existingPayrolls.Any())
            {
                // Delete related additions and deductions
                var payrollIds = existingPayrolls.Select(p => p.PayrollId).ToList();

                var existingAdditions = _context.PersonalAdditionals.Where(a => payrollIds.Contains(a.PayrollId));
                _context.PersonalAdditionals.RemoveRange(existingAdditions);

                var existingDeductions = _context.PersonalDeductions.Where(d => payrollIds.Contains(d.PayrollId));
                _context.PersonalDeductions.RemoveRange(existingDeductions);

                // Delete payrolls
                _context.Payrolls.RemoveRange(existingPayrolls);

                await _context.SaveChangesAsync();
            }

            // Add new payrolls
            foreach (var employee in request.EmployeeData)
            {
                var payroll = new Payroll
                {
                    EmployeeId = employee.Id ?? 0,
                    MonthYear = request.TransactionData.StartDate ?? DateTime.Now,
                    Salary = employee.Salary ?? 0,
                    TotalAdditions = employee.TotalAdditions ?? 0,
                    TotalDeductions = employee.TotalDeductions ?? 0,
                    NetSalary = employee.TotalPayment ?? 0,
                    CreateBy = "System",
                    CreateDate = DateTime.UtcNow,
                    PeriodId = periodId,
                    PayDate = request.TransactionData.PaymentDate,
                    PaymentStatus = request.TransactionData.Status ?? PeriodStatus.Draft,
                    SocialSecurity = employee.SocialSecurity ?? 0,
                    Tax401 = employee.Tax401,
                    Tax402 = employee.Tax402,
                    SocialSecurityRate = request.TransactionData.SocialSecurityRate
                };

                _context.Payrolls.Add(payroll);
                await _context.SaveChangesAsync();

                var payrollId = payroll.PayrollId;

                // Add new additions
                if (employee.Additions != null)
                {
                    foreach (var addition in employee.Additions)
                    {
                        var personalAddition = new PersonalAdditional
                        {
                            EmployeeId = employee.Id ?? 0,
                            AdditionName = addition.AdditionName,
                            AdditionAmount = addition.Amount ?? 0,
                            AdditionDate = DateTime.UtcNow,
                            MonthYear = request.TransactionData.StartDate ?? DateTime.Now,
                            IsActive = true,
                            CreateBy = "System",
                            CreateDate = DateTime.UtcNow,
                            AdditionType = addition.Type,
                            PayrollId = payrollId
                        };

                        _context.PersonalAdditionals.Add(personalAddition);
                    }
                }

                // Add new deductions
                if (employee.Deductions != null)
                {
                    foreach (var deduction in employee.Deductions)
                    {
                        var personalDeduction = new PersonalDeduction
                        {
                            EmployeeId = employee.Id ?? 0,
                            DeductionName = deduction.DeductionName,
                            DeductionAmount = deduction.Amount ?? 0,
                            DeductionDate = DateTime.UtcNow,
                            MonthYear = request.TransactionData.StartDate ?? DateTime.Now,
                            IsActive = true,
                            CreateBy = "System",
                            CreateDate = DateTime.UtcNow,
                            DeductionType = deduction.Type,
                            PayrollId = payrollId
                        };

                        _context.PersonalDeductions.Add(personalDeduction);
                    }
                }

                await _context.SaveChangesAsync();
            }
        }

        public class ServiceResponseData
        {
            public bool IsSuccess { get; set; }
            public string Message { get; set; }
            public object? Data { get; set; }
        }
        public async Task<ServiceResponseData> GetPayrollDetailsByParametersAsync(PaymentChannel paymentChannel, int paymentTypeId, int periodId)
        {
            try
            {
                // Check if period exists with paymentChannel and paymentTypeId
                var period = await _context.PeriodPayrolls
                    .FirstOrDefaultAsync(p => p.PeriodId == periodId &&
                                              p.PaymentChannel == paymentChannel &&
                                              p.PaymentTypeId == paymentTypeId);

                if (period == null)
                {
                    return new ServiceResponseData
                    {
                        IsSuccess = false,
                        Message = "Period not found for the specified parameters."
                    };
                }

                // Get Payrolls associated with the period
                var payrolls = await _context.Payrolls
                    .Where(p => p.PeriodId == periodId)
                    .ToListAsync();

                if (!payrolls.Any())
                {
                    return new ServiceResponseData
                    {
                        IsSuccess = false,
                        Message = "No payroll data found for the specified period."
                    };
                }

                // Get employee data along with payroll details using joins
                var employees = await (from e in _context.Employees
                                       join em in _context.Employments on e.Id equals em.EmployeeId into employment
                                       from em in employment.DefaultIfEmpty()
                                       join et in _context.EmployeeTypes on em.EmployeeTypeId equals et.EmployeeTypeId into etJoin
                                       from et in etJoin.DefaultIfEmpty()
                                       join pt in _context.PaymentTypes on em.PaymentTypeId equals pt.PaymentTypeId into ptJoin
                                       from pt in ptJoin.DefaultIfEmpty()
                                       join ds in _context.Designations on em.DesignationId equals ds.DesignationId into dsJoin
                                       from ds in dsJoin.DefaultIfEmpty()
                                       join dm in _context.Departments on ds.DepartmentId equals dm.DepartmentId into dmJoin
                                       from dm in dmJoin.DefaultIfEmpty()
                                       join p in _context.Payrolls on e.Id equals p.EmployeeId // Join Payroll with Employee directly
                                       where p.PeriodId == periodId
                                       select new EmployeeData
                                       {
                                           Id = e.Id,
                                           FirstNameEn = e.FirstNameEn,
                                           LastNameEn = e.LastNameEn,
                                           Email = e.Email,
                                           IsActive = e.IsActive,
                                           Salary = p.Salary,
                                           EffectiveDate = em.EffectiveDate,
                                           PaymentTypeId = em.PaymentTypeId,
                                           PaymentTypeName = pt.PaymentTypeNameEn,
                                           EmployeeType = em.EmployeeTypeId,
                                           EmployeeTypeName = et.EmployeeTypeNameEn,
                                           TotalDeductions = p.TotalDeductions,
                                           TotalAdditions = p.TotalAdditions,
                                           BankAccountNo = e.BankAccountNo,
                                           DepartmentName = dm.DepartmentNameEn,
                                           DesignationName = ds.DesignationNameEn,
                                           TotalPayment = p.NetSalary,
                                           Status = p.PaymentStatus.ToString(),
                                           SocialSecurity = p.SocialSecurity,
                                           Tax401 = p.Tax401,
                                           Tax402 = p.Tax402,
                                           Deductions = _context.PersonalDeductions
                                               .Where(d => d.EmployeeId == e.Id && d.PayrollId == p.PayrollId)
                                               .Select(d => new DeductionData
                                               {
                                                   DeductionId = d.PersonalDeductionId,
                                                   DeductionName = d.DeductionName,
                                                   Amount = d.DeductionAmount,
                                                   IsPersonal = true,
                                                   Type = (DeductionTypeEnum)d.DeductionType
                                               }).ToList(),
                                           Additions = _context.PersonalAdditionals
                                               .Where(a => a.EmployeeId == e.Id && a.PayrollId == p.PayrollId)
                                               .Select(a => new AdditionData
                                               {
                                                   AdditionId = a.PersonalAdditionId,
                                                   AdditionName = a.AdditionName,
                                                   Amount = a.AdditionAmount,
                                                   IsPersonal = true,
                                                   Type = (AdditionTypeEnum)a.AdditionType
                                               }).ToList()
                                       }).ToListAsync();

                // Create Payroll Summary
                var summary = new PayrollSummary
                {
                    TotalEmployee = employees.Count,
                    SumSalary = payrolls.Sum(p => p.Salary),
                    TotalAddiction = payrolls.Sum(p => p.TotalAdditions),
                    TotalDeduction = payrolls.Sum(p => p.TotalDeductions ),
                    NetPayment = payrolls.Sum(p => p.NetSalary),
                    BankPayment = payrolls
                    .Where(p => period.PaymentChannel == PaymentChannel.BankTransfer)
                    .Sum(p => p.NetSalary),
                                CashPayment = payrolls
                    .Where(p => period.PaymentChannel == PaymentChannel.CashPayment)
                    .Sum(p => p.NetSalary)
                };
                var transactionData = new TransactionDataRespond
                {
                    TransactionDate = period.PaymentDate,
                    StartDate = period.PeriodStartDate,
                    EndDate = period.PeriodEndDate,
                    PaymentDate = period.PaymentDate,
                    SocialSecurityRate = payrolls.FirstOrDefault()?.SocialSecurityRate,
                    Status = (PeriodStatus?)period.Status,
                    Summary = summary,
                    PaymentChannel = period.PaymentChannel,
                    PaymentTypeId = period.PaymentTypeId,
                    PeriodId = period.PeriodId,

                };
                // Return the result
                return new ServiceResponseData
                {
                    IsSuccess = true,
                    Data = new
                    {
                        TransactionData = transactionData,
                        Summary = summary,
                        EmployeeData = employees
                    }
                };
            }
            catch (Exception ex)
            {
                return new ServiceResponseData
                {
                    IsSuccess = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }
        public async Task<List<PeriodPayrollDto>> GetPeriodsByStatusAndMonthAsync(PeriodStatusRequest request)
        {
            var query = _context.PeriodPayrolls.AsQueryable();

            if (!request.Status.HasValue)
            {
                query = query.Where(p => (int?)p.Status != (int)PeriodStatus.Draft);
            }
            else
            {
                query = query.Where(p => (int?)p.Status == request.Status.Value && (int?)p.Status != (int)PeriodStatus.Draft);
            }

            if (request.Month.HasValue)
            {
                query = query.Where(p => p.MonthYear.Value.Year == request.Month.Value.Year &&
                                         p.MonthYear.Value.Month == request.Month.Value.Month);
            }

            var periods = await query
                .OrderByDescending(p => p.PeriodEndDate)
                .Select(p => new PeriodPayrollDto
                {
                    PeriodId = p.PeriodId,
                    PeriodStartDate = p.PeriodStartDate,
                    PeriodEndDate = p.PeriodEndDate,
                    MonthYear = p.MonthYear,
                    CreateDate = p.CreateDate,
                    CreateBy = p.CreateBy,
                    UpdateDate = p.UpdateDate,
                    UpdateBy = p.UpdateBy,
                    TotalCost = p.TotalCost,
                    TotalPayment = p.TotalPayment,
                    Status = ((PeriodStatus)p.Status).ToString(),
                    PaymentDate = p.PaymentDate,
                    PaymentTypeId = p.PaymentTypeId,
                    PaymentChannel = p.PaymentChannel,
                    Reason = p.Reason
                })
                .ToListAsync();


            return periods;
        }

        public class UpdatePeriodStatusRequest
        {
            public int PeriodId { get; set; }
            public string? Reason { get; set; }
            public PeriodStatus Status { get; set; }  // Example: "Approved", "Declined"
        }

        public async Task<bool> UpdatePeriodStatusAsync(int periodId, PeriodStatus status, string? reason)
        {
            var period = await _context.PeriodPayrolls.FindAsync(periodId);

            if (period == null)
            {
                return false;
            }

            // Update period status
            period.Status = status;
            period.Reason = reason;
            period.CreateDate = period.CreateDate?.ToUniversalTime();
            period.UpdateDate = DateTime.UtcNow;
            period.PeriodStartDate = period.PeriodStartDate?.ToUniversalTime();
            period.PeriodEndDate = period.PeriodEndDate?.ToUniversalTime();
            period.PaymentDate = period.PaymentDate?.ToUniversalTime();
            period.MonthYear = period.MonthYear?.ToUniversalTime();

            _context.PeriodPayrolls.Update(period);
            await _context.SaveChangesAsync();

            string templateKey = "";
            string languageCode = "th"; // เปลี่ยนได้ตามระบบ

            if (status == PeriodStatus.Pending)
            {
                templateKey = "PAYROLL_APPROVAL_REQUEST";
            }
            else if (status == PeriodStatus.Approved)
            {
                templateKey = "PAYROLL_APPROVED";
            }
            var values = new Dictionary<string, string>
                    {
                        { "PayrollMonth", period.MonthYear?.ToString("MMMM yyyy", new System.Globalization.CultureInfo("th-TH")) ?? "-" },
                        { "StartDate", period.PeriodStartDate?.ToString("dd/MM/yyyy") ?? "-" },
                        { "EndDate", period.PeriodEndDate?.ToString("dd/MM/yyyy") ?? "-" },
                    };
            if (!string.IsNullOrEmpty(templateKey))
            {
                // ดึง template และแทนค่า
                var (subject, message) = await EmailHelper.GetTemplateWithContentAsync(
                    _serviceProvider,
                    templateKey,
                    values,
                    languageCode
                );

                if (!string.IsNullOrWhiteSpace(subject) && !string.IsNullOrWhiteSpace(message))
                {
                    // เรียกใช้ฟังก์ชันดึงอีเมลพนักงานใน period นี้
                    var employeeEmails = await GetEmployeeEmailsByPeriodAsync(periodId);

                    foreach (var email in employeeEmails)
                    {
                        if (!string.IsNullOrWhiteSpace(email))
                        {
                            await EmailHelper.SendEmailBySettingAsync(_serviceProvider, email, subject, message);
                        }
                    }
                }
            }
            //if (!string.IsNullOrEmpty(templateKey))
            //{
            //    (subject, message) = await _emailService.GetTemplateWithContentAsync(templateKey, values, languageCode);

            //    if (!string.IsNullOrWhiteSpace(subject) && !string.IsNullOrWhiteSpace(message))
            //    {
            //        // ✅ เรียกใช้ฟังก์ชันดึงอีเมลพนักงานใน period นี้
            //        var employeeEmails = await GetEmployeeEmailsByPeriodAsync(periodId);

            //        foreach (var email in employeeEmails)
            //        {
            //            await _emailService.SendEmailBySettingAsync(email, subject, message);
            //        }
            //    }
            //}


            return true;
        }

        public async Task<List<string>> GetEmployeeEmailsByPeriodAsync(int periodId)
        {
            var emails = await (from payroll in _context.Payrolls
                                join emp in _context.Employees on payroll.EmployeeId equals emp.Id
                                where payroll.PeriodId == periodId
                                      && emp.IsActive == true
                                      && !string.IsNullOrWhiteSpace(emp.Email)
                                select emp.Email)
                                .Distinct()
                                .ToListAsync();

            return emails;
        }


        public async Task<bool> UpdatePayrollStatusByPeriodAsync(int periodId, PeriodStatus status)
        {
            // Find payroll by period
            var payrolls = await _context.Payrolls
                .Where(p => p.PeriodId == periodId)
                .ToListAsync();

            if (!payrolls.Any())
            {
                return false; // No payrolls found
            }

            // Update each payroll's status and other properties
            foreach (var payroll in payrolls)
            {
                payroll.PaymentStatus = status;
                payroll.CreateDate = payroll.CreateDate.ToUniversalTime();
                payroll.UpdateDate = DateTime.UtcNow;
                payroll.PayDate = payroll.PayDate?.ToUniversalTime();
                payroll.MonthYear = payroll.MonthYear.ToUniversalTime();
            }

            // Update all modified payrolls in the database
            _context.Payrolls.UpdateRange(payrolls);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<TaxResult> GetEstimatedTaxAsync(int employeeId)
        {
            try
            {
                // Call the PostgreSQL function using raw SQL
                var result = await _context
                    .Set<TaxResult>() // Map the result to TaxResult class
                    .FromSqlInterpolated($"SELECT * FROM \"solution-one\".\"hr-fn-estimated-tax\"({employeeId})")
                    .FirstOrDefaultAsync();

                if (result == null)
                {
                    throw new Exception("Employee or tax data not found.");
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error calculating tax: {ex.Message}");
            }
        }

        public class TransactionDataRespond
        {
            public DateTime? TransactionDate { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public DateTime? PaymentDate { get; set; }
            public decimal? SocialSecurityRate { get; set; }
            public PeriodStatus? Status { get; set; }
            public PayrollSummary? Summary { get; set; }
            public PaymentChannel? PaymentChannel { get; set; }
            public int? PaymentTypeId { get; set; }
            public int? PeriodId { get; set; }
        }

        public class EmployeePaymentDto
        {
            public decimal Id { get; set; }
            public string? FirstNameEn { get; set; }
            public string? LastNameEn { get; set; }
            public string? Email { get; set; }
            public bool IsActive { get; set; }
            public decimal? Salary { get; set; }
            public DateTime? EffectiveDate { get; set; }
            public int? PaymentTypeId { get; set; }
            public string? PaymentTypeName { get; set; }
            public int? EmployeeType { get; set; }
            public string? EmployeeTypeName { get; set; }
            public List<DeductionInfo>? Deductions { get; set; }
            public List<AdditionInfo>? Additions { get; set; }
            public decimal? TotalDeductions { get; set; }
            public decimal? TotalAdditions { get; set; }
            public string? BankAccountNo { get; set; }
            public string? DepartmentName { get; set; }
            public string? DesignationName { get; set; }
        }

        public class EmployeeDto
        {
            public decimal Id { get; set; }
            public string? FirstNameEn { get; set; }
            public string? LastNameEn { get; set; }
            public string? Email { get; set; }
            public bool IsActive { get; set; }
            public decimal? Salary { get; set; }
            public DateTime? EffectiveDate { get; set; }
            public int? PaymentTypeId { get; set; }
            public string? PaymentTypeName { get; set; }
            public int? EmployeeType { get; set; }
            public string? EmployeeTypeName { get; set; }
            public List<DeductionInfo>? Deductions { get; set; }
            public List<AdditionInfo>? Additions { get; set; }
            public decimal? TotalDeductions { get; set; }
            public decimal? TotalAdditions { get; set; }
            public string? BankAccountNo { get; set; }
            public string? DepartmentName { get; set; }
            public string? DesignationName { get; set; }
        }

        public class ApiRequest
        {
            public List<EmployeeData>? EmployeeData { get; set; }
            public TransactionData? TransactionData { get; set; }
        }

        public class EmployeeData
        {
            public decimal? Id { get; set; }
            public string? FirstNameEn { get; set; }
            public string? LastNameEn { get; set; }
            public string? Email { get; set; }
            public bool IsActive { get; set; }
            public decimal? Salary { get; set; }
            public DateTime? EffectiveDate { get; set; }
            public int? PaymentTypeId { get; set; }
            public string? PaymentTypeName { get; set; }
            public int? EmployeeType { get; set; }
            public string? EmployeeTypeName { get; set; }
            public List<DeductionData>? Deductions { get; set; }
            public List<AdditionData>? Additions { get; set; }
            public decimal? TotalDeductions { get; set; }
            public decimal? TotalAdditions { get; set; }
            public string? BankAccountNo { get; set; }
            public string? DepartmentName { get; set; }
            public string? DesignationName { get; set; }
            public decimal? TotalPayment { get; set; }

            public decimal? SocialSecurity { get; set; }
            public decimal? Tax401 { get; set; }
            public decimal? Tax402 { get; set; }
            public string? Status { get; set; }
        }

        public class DeductionData
        {
            public int? DeductionId { get; set; }
            public string? DeductionName { get; set; }
            public decimal? Amount { get; set; }
            public bool? IsPersonal { get; set; }
            public DeductionTypeEnum Type { get; set; }
        }

        public class AdditionData
        {
            public int? AdditionId { get; set; }
            public string? AdditionName { get; set; }
            public decimal? Amount { get; set; }
            public bool? IsPersonal { get; set; }
            public AdditionTypeEnum Type { get; set; }
        }

        public class TransactionData
        {
            public DateTime? TransactionDate { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public DateTime? PaymentDate { get; set; }
            public decimal? SocialSecurityRate { get; set; }
            public PeriodStatus? Status { get; set; }
            public PayrollSummary? Summary { get; set; }
            public PaymentChannel? PaymentChannel { get; set; }
            public int? PaymentTypeId { get; set; }
            public int? PeriodId { get; set; }
        }

        public class PayrollSummary
        {
            public int TotalEmployee { get; set; }     // จำนวนพนักงานทั้งหมด
            public decimal SumSalary { get; set; }     // รวมเงินเดือนทั้งหมด
            public decimal TotalAddiction { get; set; } // รวมการเพิ่ม (Additions)
            public decimal TotalDeduction { get; set; } // รวมการหัก (Deductions)
            public decimal NetPayment { get; set; }     // ยอดสุทธิที่ต้องจ่าย
            public decimal BankPayment { get; set; }    // การชำระเงินผ่านธนาคาร
            public decimal CashPayment { get; set; }    // การชำระเงินด้วยเงินสด
            public decimal TotalCost { get; set; }
        }

        public class PayrollData
        {
            public int? PayrollId { get; set; }
            public int? EmployeeId { get; set; }
            public DateTime? MonthYear { get; set; }
            public decimal? Salary { get; set; }
            public decimal? TotalAdditions { get; set; }
            public decimal? TotalDeductions { get; set; }
            public decimal? NetSalary { get; set; }
            public DateTime? CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public DateTime? UpdateDate { get; set; }
            public string? UpdateBy { get; set; }
            public DateTime? PayDate { get; set; }
            public string? Remark { get; set; }
            public string? PayrollCode { get; set; }
            public int? PeriodId { get; set; }
            public int? PaymentStatus { get; set; }
            public decimal? SocialSecurity { get; set; }
            public decimal? Tax401 { get; set; }
            public string? Tax402 { get; set; }
        }
        public class PeriodRequest
        {
            public PaymentChannel PaymentChannel { get; set; }
            public int PaymentTypeId { get; set; }
            public int PeriodId { get; set; }
        }
    }
}

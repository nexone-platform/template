using Azure.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Helpers;
using Middlewares.Models;
using Ocelot.Infrastructure;
using static Middlewares.Constant.StatusConstant;

namespace HrService.Services
{
    public class PayrollService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;

        public PayrollService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;
        }

        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public async Task<List<PayrollWithEmployee>> GetPayrollsByEmployeeIdAsync(int employeeId)
        {
            // Fetch Payroll and Employee Information
            var payrolls = await (from r in _context.Payrolls
                                  join e in _context.Employees on r.EmployeeId equals e.Id
                                  where r.EmployeeId == employeeId 
                                  select new PayrollWithEmployee
                                  {
                                      PayrollId = r.PayrollId,
                                      EmployeeId = r.EmployeeId,
                                      MonthYear = r.MonthYear,
                                      Salary = r.Salary,
                                      TotalAdditions = r.TotalAdditions,
                                      TotalDeductions = r.TotalDeductions,
                                      NetSalary = r.NetSalary,
                                      CreateDate = r.CreateDate,
                                      CreateBy = r.CreateBy,
                                      Employee = new EmployeeInfo
                                      {
                                          Id = e.Id,
                                          FirstNameTh = e.FirstNameTh,
                                          LastNameTh = e.LastNameTh,
                                          FirstNameEn = e.FirstNameEn,
                                          LastNameEn = e.LastNameEn,
                                          Email = e.Email,
                                          EmployeeCode = e.EmployeeId,
                                          JoinDate = e.JoinDate
                                      }
                                  }).ToListAsync();

            // Fetch Deductions separately
            var deductions = await (from da in _context.Deductions
                                    join asign in _context.DeductionEmployeeAssignments on da.DeductionId equals asign.DeductionId
                                    where asign.EmployeeId == employeeId
                                       || _context.Employees.Where(e => e.Id == employeeId).Select(e => e.DepartmentId).Contains(asign.DepartmentId)
                                    select new DeductionInfo
                                    {
                                        DeductionId = da.DeductionId,
                                        Amount = da.UnitAmount ?? da.PercentAmount * payrolls.First().Salary / 100,
                                        IsPersonal = false
                                    })
                                     .Union(
                                         from pd in _context.PersonalDeductions
                                         where pd.EmployeeId == employeeId
                                         select new DeductionInfo
                                         {
                                             DeductionId = pd.PersonalDeductionId,
                                             Amount = pd.DeductionAmount,
                                             IsPersonal = true
                                         }
                                     ).ToListAsync();

            // Fetch Additions separately
            var additions = await (from aa in _context.Additions
                                   join asign in _context.AdditionEmployeeAssignments on aa.AdditionsId equals asign.AdditionsId
                                   where asign.EmployeeId == employeeId
                                      || _context.Employees.Where(e => e.Id == employeeId).Select(e => e.DepartmentId).Contains(asign.DepartmentId)
                                   select new AdditionInfo
                                   {
                                       AdditionId = aa.AdditionsId,
                                       Amount = aa.UnitAmount ?? aa.PercentAmount * payrolls.First().Salary / 100,
                                       IsPersonal = false
                                   })
                                    .Union(
                                        from pa in _context.PersonalAdditionals
                                        where pa.EmployeeId == employeeId
                                        select new AdditionInfo
                                        {
                                            AdditionId = pa.PersonalAdditionId,
                                            Amount = pa.AdditionAmount,
                                            IsPersonal = true
                                        }
                                    ).ToListAsync();

            // Merge Deductions and Additions with Payrolls
            foreach (var payroll in payrolls)
            {
                payroll.Deductions = deductions;
                payroll.Additions = additions;
            }

            return payrolls;
        }

        public async Task<ApiResponse<PayrollWithEmployeeDto>> GetPayrollsByYearAsync(int employeeId, int? year = null)
        {
            try
            {
                // กำหนดปี ถ้าไม่ได้รับปีจากพารามิเตอร์ให้ใช้ปีปัจจุบัน
                int selectedYear = year ?? DateTime.UtcNow.Year;

                // คำนวณช่วงเวลาในรูปแบบ UTC
                var startDate = new DateTime(selectedYear, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                var endDate = new DateTime(selectedYear, 12, 31, 23, 59, 59, DateTimeKind.Utc);

                // JOIN ข้อมูลจาก Payroll และ Employee
                var payrolls = await (from p in _context.Payrolls
                                      join e in _context.Employees on p.EmployeeId equals e.Id
                                      where p.EmployeeId == employeeId
                                       && p.MonthYear.AddDays(1) >= startDate
                                         && p.MonthYear <= endDate
                                         && p.PaymentStatus == PeriodStatus.Approved
                                      select new PayrollWithEmployeeDto
                                      {
                                          PayrollId = p.PayrollId,
                                          EmployeeId = p.EmployeeId,
                                          MonthYear = p.MonthYear,
                                          GrossSalary = p.Salary,
                                          TotalAdditions = p.TotalAdditions,
                                          TotalDeductions = p.TotalDeductions,
                                          NetSalary = p.NetSalary,

                                          Employee = new EmployeeInfo
                                          {
                                              Id = e.Id,
                                              FirstNameTh = e.FirstNameTh,
                                              LastNameTh = e.LastNameTh,
                                              FirstNameEn = e.FirstNameEn,
                                              LastNameEn = e.LastNameEn,
                                              Email = e.Email,
                                              EmployeeCode = e.EmployeeId,
                                              JoinDate = e.JoinDate,
                                              ImgPath = string.IsNullOrEmpty(e.ImgPath)
                                              ? null
                                              : e.ImgPath,
                                          }
                                      }).ToListAsync();

                return new ApiResponse<PayrollWithEmployeeDto>
                {
                    Data = payrolls,
                    TotalData = payrolls.Count
                };
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while fetching payroll data for the year.", ex);
            }
        }

        public async Task<PayrollWithEmployee> GetPayrollByIdAsync(int payrollId)
        {
            // Fetch Payroll and Employee Information for the given PayrollId
            var payroll = await (from r in _context.Payrolls
                                 join e in _context.Employees on r.EmployeeId equals e.Id into employees
                                 from e in employees.DefaultIfEmpty()
                                 join d in _context.Designations on e.DesignationId equals d.DesignationId into designations
                                 from d in designations.DefaultIfEmpty()
                                 join s in _context.Organizations on e.OrganizationId equals s.OrganizationId into organizations
                                 from s in organizations.DefaultIfEmpty()
                                 where r.PayrollId == payrollId
                                 select new PayrollWithEmployee
                                 {
                                     PayrollId = r.PayrollId,
                                     EmployeeId = r.EmployeeId,
                                     MonthYear = r.MonthYear,
                                     Salary = r.Salary,
                                     TotalAdditions = r.TotalAdditions+ r.Salary,
                                     TotalDeductions = r.TotalDeductions,
                                     NetSalary = r.NetSalary,
                                     CreateDate = r.CreateDate,
                                     CreateBy = r.CreateBy,
                                     PayDate = r.PayDate,
                                     NetSalaryInWords = NumberToWordsHelper.ConvertToWords(r.NetSalary),
                                     PayrollCode = r.PayrollCode,
                                     BankAccountNo = e.BankAccountNo,
                                     PayrollPeriod = $"{new DateTime(r.MonthYear.Year, r.MonthYear.Month, 1).ToString("dd/MM/yyyy")} - {new DateTime(r.MonthYear.Year, r.MonthYear.Month, DateTime.DaysInMonth(r.MonthYear.Year, r.MonthYear.Month)).ToString("dd/MM/yyyy")}",
                                     Employee = new EmployeeInfo
                                     {
                                         Id = e.Id,
                                         FirstNameTh = e.FirstNameTh,
                                         LastNameTh = e.LastNameTh,
                                         FirstNameEn = e.FirstNameEn,
                                         LastNameEn = e.LastNameEn,
                                         Email = e.Email,
                                         EmployeeCode = e.EmployeeId,
                                         JoinDate = e.JoinDate,
                                         Company = s.OrganizationNameEn,
                                         DesignationName = d.DesignationNameEn,
                                         BankAccountNo = e.BankAccountNo,
                                         Logo = string.IsNullOrEmpty(s.Logo)
                                              ? null
                                              : $"{_httpContextAccessor.HttpContext.Request.Scheme}://{_httpContextAccessor.HttpContext.Request.Host}/" + Uri.EscapeUriString(s.Logo),
                                         CompanyAddress = ((s.Address ?? "") + " " + (s.Country ?? "") + " " + (s.State ?? "") + " " + (s.City ?? "") + " " + (s.PostalCode ?? "")).Trim()
                                     }
                                 }).FirstOrDefaultAsync();

            if (payroll == null)
                return null; // Payroll not found

            // Fetch Deductions for the given PayrollId
            var deductions = await (from da in _context.Deductions
                                    join asign in _context.DeductionEmployeeAssignments on da.DeductionId equals asign.DeductionId
                                    where asign.EmployeeId == payroll.EmployeeId
                                       || _context.Employees
                                          .Where(e => e.Id == payroll.EmployeeId)
                                          .Select(e => e.DepartmentId)
                                          .Contains(asign.DepartmentId)
                                    select new DeductionInfo
                                    {
                                        DeductionId = da.DeductionId,
                                        DeductionName = da.DeductionName,
                                        Amount = da.UnitAmount ?? (da.PercentAmount * payroll.Salary / 100),
                                        IsPersonal = false
                                    })
                                     .Union(
                                         from pd in _context.PersonalDeductions
                                         where pd.PayrollId == payrollId
                                         select new DeductionInfo
                                         {
                                             DeductionId = pd.PersonalDeductionId,
                                             DeductionName = pd.DeductionName,
                                             Amount = pd.DeductionAmount,
                                             IsPersonal = true
                                         }
                                     ).ToListAsync();

            // Fetch Additions for the given PayrollId
            var additions = await (from aa in _context.Additions
                                   join asign in _context.AdditionEmployeeAssignments on aa.AdditionsId equals asign.AdditionsId
                                   where asign.EmployeeId == payroll.EmployeeId
                                      || _context.Employees
                                         .Where(e => e.Id == payroll.EmployeeId)
                                         .Select(e => e.DepartmentId)
                                         .Contains(asign.DepartmentId)
                                   select new AdditionInfo
                                   {
                                       AdditionId = aa.AdditionsId,
                                       AdditionName = aa.AdditionsName,
                                       Amount = aa.UnitAmount ?? (aa.PercentAmount * payroll.Salary / 100),
                                       IsPersonal = false
                                   })
                                    .Union(
                                        from pa in _context.PersonalAdditionals
                                        where pa.PayrollId == payrollId
                                        select new AdditionInfo
                                        {
                                            AdditionId = pa.PersonalAdditionId,
                                            AdditionName = pa.AdditionName,
                                            Amount = pa.AdditionAmount,
                                            IsPersonal = true
                                        }
                                    ).ToListAsync();


            // Assign Deductions and Additions to the Payroll
            payroll.Deductions = deductions;
            payroll.Additions = additions;

            // Calculate YTD for Deductions and Additions
            var ytdDeductions = await _context.PersonalDeductions
                .Where(pd => pd.EmployeeId == payroll.EmployeeId && pd.DeductionDate.Year == payroll.MonthYear.Year)
                .SumAsync(pd => pd.DeductionAmount);

            var ytdSalary = await _context.Payrolls
                .Where(p => p.EmployeeId == payroll.EmployeeId && p.MonthYear.AddDays(1).Year == payroll.MonthYear.Year)
                .SumAsync(p => p.Salary);

            // Calculate YTD for Net Salary
            var ytdNetSalary = await _context.Payrolls
                .Where(p => p.EmployeeId == payroll.EmployeeId && p.MonthYear.Year == payroll.MonthYear.Year)
                .SumAsync(p => p.NetSalary);

            var penaltyAmount = await _context.PersonalDeductions
                    .Where(pa => pa.DeductionType == DeductionTypeEnum.AbsentLeaveLate && pa.PayrollId == payrollId && pa.IsActive)
                    .SumAsync(pa => pa.DeductionAmount);

            var socialSecurityFund = await _context.PersonalDeductions
                .Where(pa => pa.DeductionType == DeductionTypeEnum.SocialSecurityFund && pa.PayrollId == payrollId && pa.IsActive)
                .SumAsync(pa => pa.DeductionAmount);

            var studentLoad = await _context.PersonalDeductions
                          .Where(pa => pa.DeductionType == DeductionTypeEnum.StudentLoanFund && pa.PayrollId == payrollId && pa.IsActive)
                          .SumAsync(pa => pa.DeductionAmount);

            var wht = await _context.PersonalDeductions
                        .Where(pa => pa.DeductionType == DeductionTypeEnum.WithholdingTax && pa.PayrollId == payrollId && pa.IsActive)
                        .SumAsync(pa => pa.DeductionAmount);


            var otherDeductions = await _context.PersonalDeductions
                 .Where(pa => pa.DeductionType == DeductionTypeEnum.Other && pa.PayrollId == payrollId && pa.IsActive)
                 .SumAsync(pa => pa.DeductionAmount);


            var overtime = await _context.PersonalAdditionals
                 .Where(pa => pa.AdditionType == AdditionTypeEnum.Overtime && pa.PayrollId == payrollId && pa.IsActive)
                 .SumAsync(pa => pa.AdditionAmount);

            var commission = await _context.PersonalAdditionals
                .Where(pa => pa.AdditionType == AdditionTypeEnum.Commission && pa.PayrollId == payrollId && pa.IsActive)
                .SumAsync(pa => pa.AdditionAmount);

            var otherAdditions = await _context.PersonalAdditionals
                .Where(pa => (pa.AdditionType == AdditionTypeEnum.Other || pa.AdditionType == AdditionTypeEnum.Travel || pa.AdditionType == AdditionTypeEnum.Shift) && pa.PayrollId == payrollId && pa.IsActive)
                .SumAsync(pa => pa.AdditionAmount);

            var bonus = await _context.PersonalAdditionals
                .Where(pa => pa.AdditionType == AdditionTypeEnum.Bonus && pa.PayrollId == payrollId && pa.IsActive)
                .SumAsync(pa => pa.AdditionAmount);
            // Add the YTD values to the Payroll object
            payroll.YtdEarnings = ytdSalary;
            payroll.YtdWithholdingTax = wht;
            payroll.AccumulatedSsf = socialSecurityFund;


            payroll.SocialSecurityFund = socialSecurityFund;
            payroll.Wht = wht;
            payroll.PenaltyAmount = penaltyAmount;
            payroll.Slf = studentLoad;
            payroll.OtherDeductions = otherDeductions;

            payroll.Overtime = overtime;
            payroll.Bonus = bonus;
            payroll.OtherAdditions = otherAdditions;
            payroll.Commission = commission;
            return payroll;
        }
        public async Task<string?> GetLastSalaryIdByEmployeeIdAsync(int employeeId)
        {
            // Query the latest salary record for the employee
            var lastSalaryId = await _context.Payrolls
                .Where(p => p.EmployeeId == employeeId && p.PaymentStatus == PeriodStatus.Approved)
                .OrderByDescending(p => p.CreateDate) 
                .Select(p => p.PayrollId)
                .FirstOrDefaultAsync(); 

            return lastSalaryId.ToString();
        }


        public class EmployeeInfo
        {
            public decimal Id { get; set; }
            public string? FirstNameTh { get; set; }
            public string? LastNameTh { get; set; }
            public string? FirstNameEn { get; set; }
            public string? LastNameEn { get; set; }
            public string? Email { get; set; }
            public string? EmployeeCode { get; set; }
            public DateTime? JoinDate { get; set; }
            public string? ImgPath { get; set; }
            public string? CompanyAddress { get; set; }
            public string? DesignationName { get; set; }
            public string? Company { get; set; }
            public string? Logo { get; set; }
            public string? BankAccountNo { get; set; }
        }

        public class PayrollWithEmployeeDto
        {
            public int PayrollId { get; set; }
            public decimal EmployeeId { get; set; }
            public DateTime MonthYear { get; set; }
            public decimal GrossSalary { get; set; }
            public decimal TotalAdditions { get; set; }
            public decimal TotalDeductions { get; set; }
            public decimal NetSalary { get; set; }
            public EmployeeInfo? Employee { get; set; }
        }

        public class PayrollWithEmployee
        {
            public int PayrollId { get; set; }
            public decimal EmployeeId { get; set; }
            public DateTime MonthYear { get; set; }
            public DateTime? PayDate { get; set; }
            public decimal Salary { get; set; }
            public decimal TotalAdditions { get; set; }
            public decimal TotalDeductions { get; set; }
            public decimal NetSalary { get; set; }
            public string? NetSalaryInWords { get; set; }
            public string? PayrollCode { get; set; }
            public DateTime CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public string PayrollPeriod { get; set; } // e.g., "01/01/2024 - 31/01/2024"
            public string BankAccountNo { get; set; }
            public decimal? YtdEarnings { get; set; }
            public decimal? YtdWithholdingTax { get; set; }
            public decimal? AccumulatedSsf { get; set; }
            public string? Remarks { get; set; }
            public EmployeeInfo? Employee { get; set; }
            public List<DeductionInfo>? Deductions { get; set; } // รายการหักทั้งหมด
            public decimal? SocialSecurityFund { get; set; }
            public decimal? Wht { get; set; }
            public decimal? Slf { get; set; }
            public decimal? PenaltyAmount { get; set; }
            public decimal? OtherDeductions { get; set; }
            public List<AdditionInfo>? Additions { get; set; } // รายการเบิกทั้งหมด
            public decimal? Overtime { get; set; }
            public decimal? Commission { get; set; }
            public decimal? Bonus { get; set; }
            public decimal? OtherAdditions { get; set; }
        }

        public class AdditionInfo
        {
            public int AdditionId { get; set; }
            public string? AdditionName { get; set; }
            public decimal? Amount { get; set; }
            public bool IsPersonal { get; set; } // True for personal, False for master
        }

        public class DeductionInfo
        {
            public int DeductionId { get; set; }
            public string? DeductionName { get; set; }
            public decimal? Amount { get; set; }
            public bool IsPersonal { get; set; } // True for personal, False for master
        }
    }
}

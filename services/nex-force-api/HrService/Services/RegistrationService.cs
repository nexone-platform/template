using Middleware.Data;
using Middlewares;
using AutoMapper;
using Middleware.Models;
using Microsoft.EntityFrameworkCore;
using static Middlewares.Constant.StatusConstant;

namespace HrService.Services
{
    public class RegistrationService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;

        public RegistrationService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;

        }

        public class EmployeeReportDto
        {
            public decimal Id { get; set; }
            public string EmployeeId { get; set; }
            public string? FullName { get; set; }
            public string? CitizenId { get; set; }
            public string? Gender { get; set; }
            public string? Nationality { get; set; }
            public DateTime? BirthDate { get; set; }
            public int? Age { get; set; }
            public string? Department { get; set; } 
            public string? Designation { get; set; }
            public string? Address { get; set; }
            public decimal? Salary { get; set; }
            public DateTime? JoinDate { get; set; }
            public DateTime? ProbationEndDate { get; set; }
            public DateTime? ResignationDate { get; set; }
            public double? WorkAgeInYears { get; set; }
            public decimal? TravelAllowance { get; set; }
            public decimal? ShiftAllowance { get; set; }
            public decimal? AttendanceBonus { get; set; }
            public string? Status { get; set; }
            public string? Remark { get; set; }
        }
        public async Task<List<EmployeeReportDto>> SearchEmployeesAsync(
            int? year = null,
            bool? isActive = null,
            int? departmentId = null,
            int? genderId = null)
        {

            var targetTypes = new[]
            {
                            AdditionTypeEnum.Travel,
                            AdditionTypeEnum.Shift,
                            AdditionTypeEnum.Commission
            };

            var allAdditions = await _context.Additions
                .Where(a => a.IsActive == true && targetTypes.Contains((AdditionTypeEnum)a.AdditionType))
                .ToListAsync();

            var additionDict = allAdditions.ToDictionary(
                a => (AdditionTypeEnum)a.AdditionType,
                a => a.AdditionsId);

            var allAssignments = await _context.AdditionEmployeeAssignments
              .Where(a => a.IsActive == true)
              .ToListAsync();

            var assignmentLookup = allAssignments
                .GroupBy(a => a.AdditionsId)
                .ToDictionary(g => g.Key, g => g.ToList());
            var startDate = year.HasValue
                ? DateTime.SpecifyKind(new DateTime(year.Value, 1, 1), DateTimeKind.Utc)
                : (DateTime?)null;

            var endDate = year.HasValue
                ? DateTime.SpecifyKind(new DateTime(year.Value, 12, 31, 23, 59, 59), DateTimeKind.Utc)
                : (DateTime?)null;

            var allPersonalAdditionals = await _context.PersonalAdditionals
                .Where(p => p.IsActive == true &&
                            targetTypes.Contains((AdditionTypeEnum)p.AdditionType) &&
                            (!startDate.HasValue ||
                             (p.MonthYear >= startDate && p.MonthYear <= endDate)))
                .ToListAsync();

            var personalLookup = allPersonalAdditionals
                .GroupBy(p => p.EmployeeId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var query = from emp in _context.Employees
                        join dept in _context.Departments on emp.DepartmentId equals dept.DepartmentId into deptJoin
                        from dept in deptJoin.DefaultIfEmpty()
                        join gender in _context.Genders on emp.Gender equals gender.GenderId into genderJoin
                        from gender in genderJoin.DefaultIfEmpty()
                        join resign in _context.Resignations
                            .Where(r => r.IsApproved == true) on emp.Id equals resign.EmployeeId into resignJoin
                        from resign in resignJoin
                            .OrderByDescending(r => r.ResignationDate)
                            .Take(1)
                            .DefaultIfEmpty()

                        select new
                        {
                            emp,
                            dept,
                            gender,
                            resign,
                            desig = (from e in _context.Employments
                                     where e.EmployeeId == emp.Id
                                     orderby e.EffectiveDate descending
                                     select new
                                     {
                                         e.Salary,
                                         DesignationName = e.Designation != null ? e.Designation.DesignationNameEn : null
                                     }).FirstOrDefault()
                        };
            // เงื่อนไขกรองตามปี (year) เฉพาะถ้ามีค่า
            if (year.HasValue && year > 0)
            {
                var start = DateTime.SpecifyKind(new DateTime(year.Value, 1, 1), DateTimeKind.Utc);
                var end = DateTime.SpecifyKind(new DateTime(year.Value, 12, 31), DateTimeKind.Utc);
                query = query.Where(x =>
                    x.emp.JoinDate <= end &&
                    (x.emp.ResignationDate == null || x.emp.ResignationDate >= start));
            }
            if (isActive.HasValue)
                query = query.Where(x => x.emp.IsActive == isActive.Value);

            if (departmentId > 0)
                query = query.Where(x => x.emp.DepartmentId == departmentId.Value);

            if (genderId > 0)
                query = query.Where(x => x.emp.Gender == genderId.Value);


            var list = await query.ToListAsync();

            var result = list.Select(x =>
            {
                decimal? GetAssignmentAddition(AdditionTypeEnum type)
                {
                    if (!additionDict.TryGetValue(type, out var additionId))
                        return null;

                    if (!assignmentLookup.TryGetValue(additionId, out var assignments))
                        return null;

                    var matchedAssignment = assignments.FirstOrDefault(a =>
                        (a.AssignmentType == (int)AssignmentType.Specific && a.EmployeeId == x.emp.Id) ||
                        (a.AssignmentType == (int)AssignmentType.Department && a.DepartmentId == x.emp.DepartmentId) ||
                        (a.AssignmentType == (int)AssignmentType.AllEmployees));

                    return matchedAssignment != null
                        ? allAdditions.First(a => a.AdditionsId == additionId).UnitAmount
                        : null;
                }

                decimal? GetPersonalAddition(AdditionTypeEnum type)
                {
                    if (!personalLookup.TryGetValue(x.emp.Id, out var personalList))
                        return null;

                    return personalList
                        .Where(p => (AdditionTypeEnum)p.AdditionType == type)
                        .Sum(p => (decimal?)p.AdditionAmount) ?? null;
                }

                decimal? CombineAddition(AdditionTypeEnum type)
                {
                    var fromAssignment = GetAssignmentAddition(type);
                    var fromPersonal = GetPersonalAddition(type);
                    return (fromAssignment ?? 0) + (fromPersonal ?? 0);
                }

                return new EmployeeReportDto
                {
                    Id = x.emp.Id,
                    EmployeeId = x.emp.EmployeeId,
                    FullName = x.emp.FirstNameEn + " " + x.emp.LastNameEn,
                    CitizenId = x.emp.PassportNo,
                    Gender = x.gender?.GenderName,
                    Nationality = x.emp.Nationality,
                    BirthDate = x.emp.BirthDate,
                    Age = x.emp.BirthDate.HasValue ? CalculateAge(x.emp.BirthDate.Value) : null,
                    Department = x.dept?.DepartmentNameEn,
                    Designation = x.desig?.DesignationName,
                    Address = $"{x.emp.Address} {x.emp.State} {x.emp.Country} {x.emp.PinCode}",
                    Salary = x.desig?.Salary,
                    JoinDate = x.emp.JoinDate,
                    ProbationEndDate = x.emp.JoinDate?.AddDays(119),
                    ResignationDate = x.emp.ResignationDate,
                    WorkAgeInYears = CalculateWorkAgeDecimal(x.emp.JoinDate, x.emp.ResignationDate),
                    Status = x.emp.IsActive ? "working" : "resigned",
                    TravelAllowance = CombineAddition(AdditionTypeEnum.Travel),
                    ShiftAllowance = CombineAddition(AdditionTypeEnum.Shift),
                    AttendanceBonus = CombineAddition(AdditionTypeEnum.Commission),
                    Remark = x.resign?.Reason

                };
            }).ToList();

            return result;
        }
        private int CalculateAge(DateTime birthDate)
        {
            var today = DateTime.Today;
            var age = today.Year - birthDate.Year;
            if (birthDate.Date > today.AddYears(-age)) age--;
            return age;
        }

        private double? CalculateWorkAgeDecimal(DateTime? joinDate, DateTime? resignationDate)
        {
            if (!joinDate.HasValue) return null;

            var endDate = resignationDate ?? DateTime.Today;

            int totalMonths = (endDate.Year - joinDate.Value.Year) * 12 + (endDate.Month - joinDate.Value.Month);
            if (endDate.Day < joinDate.Value.Day) totalMonths--;

            double yearsDecimal = totalMonths / 12.0;

            return Math.Round(yearsDecimal, 1); // ปัดเศษทศนิยม 1 ตำแหน่ง
        }
    }
}

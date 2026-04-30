using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;
using static solutionAPI.Services.LeaveQuotaService;

namespace solutionAPI.Services
{
    public class LeaveQuotaService
    {
        private readonly ILoggingService _loggingService;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public LeaveQuotaService(ApplicationDbContext context, IMapper mapper, ILoggingService loggingService)
        {
            _mapper = mapper;
            _loggingService = loggingService;
            _context = context;
        }

        public async Task AddLeaveQuotaAsync(LeaveQuotaDto leaveQuotaDto)
        {
            var existingQuotas = await _context.LeaveQuotas
               .Where(lq => lq.EmployeeId == leaveQuotaDto.EmployeeId && lq.Year == leaveQuotaDto.Year)
               .ToListAsync();

            var existingLeaveTypeIds = existingQuotas.Select(lq => lq.LeaveTypeId).ToList();
            
            foreach (var leaveQuota in leaveQuotaDto.LeaveQuotas)
            {
                var extraDay = leaveQuota.ExtraDay ?? 0;
                if (leaveQuota.QuotaId == 0) // Insert new quota
                {
                    var newQuota = new LeaveQuota
                    {
                        EmployeeId = leaveQuotaDto.EmployeeId,
                        LeaveTypeId = leaveQuota.LeaveTypeId,
                        Quota = leaveQuota.QuotaDays,
                        ExtraDay = extraDay,
                        Year = leaveQuotaDto.Year,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = leaveQuotaDto.Username,
                        CarryForward = (decimal)(leaveQuota.QuotaDays + extraDay)
                    };
                    _context.LeaveQuotas.Add(newQuota);
                }
                else // Update existing quota
                {
                    var existingQuota = await _context.LeaveQuotas.FindAsync(leaveQuota.QuotaId);
                    if (existingQuota == null)
                    {
                        throw new InvalidOperationException($"LeaveQuota with ID {leaveQuota.QuotaId} does not exist.");
                    }

                    existingQuota.Quota = leaveQuota.QuotaDays;
                    existingQuota.ExtraDay = extraDay;
                    existingQuota.CarryForward = (decimal)(leaveQuota.QuotaDays + extraDay);
                    existingQuota.UpdateDate = DateTime.UtcNow;
                    existingQuota.UpdateBy = leaveQuotaDto.Username;
                }

                existingLeaveTypeIds.Remove(leaveQuota.LeaveTypeId);
            }

            foreach (var leaveTypeId in existingLeaveTypeIds)
            {
                var quotaToRemove = existingQuotas.FirstOrDefault(lq => lq.LeaveTypeId == leaveTypeId);
                if (quotaToRemove != null)
                {
                    _context.LeaveQuotas.Remove(quotaToRemove);
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                // Handle concurrency conflict
                var entry = ex.Entries.Single();
                var databaseValues = await entry.GetDatabaseValuesAsync();

                // Optionally, inform the user about the conflict
                throw new InvalidOperationException("The record has been modified by another user.");
            }
        }


        public async Task<List<LeaveQuotaResponseDto>> GetAllLeaveQuotasAsync()
        {
            // Get the current year, next year, and previous year
            var currentYear = DateTime.Now.Year;
            var nextYear = currentYear + 1;
            var previousYear = currentYear - 1;

            var leaveQuotas = await _context.LeaveQuotas
                .Where(lq => lq.Year == currentYear || lq.Year == nextYear || lq.Year == previousYear) // Filter by the three years
                .GroupBy(lq => new { lq.EmployeeId, lq.Employee.FirstNameEn, lq.Employee.LastNameEn })
                .Select(g => new LeaveQuotaResponseDto
                {
                    EmployeeId = g.Key.EmployeeId,
                    EmployeeName = g.Key.FirstNameEn + " " + g.Key.LastNameEn,
                    // Select the latest year, or you can return all the years if needed
                    Year = g.Max(lq => lq.Year),
                    LeaveQuotas = g.Select(lq => new LeaveQuotaDetailResponseDto
                    {
                        LeaveTypeId = lq.LeaveTypeId,
                        LeaveTypeName = lq.LeaveType.LeaveTypeNameEn,
                        QuotaDays = lq.Quota,
                        QuotaId = lq.QuotaId,
                        ExtraDay = lq.ExtraDay
                    }).ToList(),
                    SumQuotaDays = (decimal)g.Sum(lq => lq.Quota + lq.ExtraDay)
                })
                .ToListAsync();

            // Modify or return as needed based on your logic.
            return leaveQuotas;
        }

    }


    public class LeaveQuotaDTO
    {
        public int QuotaId { get; set; }
        public decimal? EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public int LeaveTypeId { get; set; }
        public string? LeaveTypeName { get; set; }
        public decimal QuotaDays { get; set; }
        public int Year { get; set; }
    }
    public class LeaveQuotaDto
    {
        public int EmployeeId { get; set; }
        public int Year { get; set; }
        public string? Username { get; set; }
        public List<LeaveQuotaDetailDto> LeaveQuotas { get; set; }
    }

    public class LeaveQuotaDetailDto
    {
        public int LeaveTypeId { get; set; }
        public int QuotaId { get; set; }
        public decimal? ExtraDay { get; set; }
        public decimal QuotaDays { get; set; }
    }
    public class LeaveQuotaResponseDto
    {
        public decimal EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public int Year { get; set; }
        public decimal SumQuotaDays { get; set; }
        public List<LeaveQuotaDetailResponseDto> LeaveQuotas { get; set; }
    }

    public class LeaveQuotaDetailResponseDto
    {
        public int LeaveTypeId { get; set; }
        public string LeaveTypeName { get; set; }
        public decimal QuotaDays { get; set; }
        public int QuotaId { get; set; }
        public decimal? ExtraDay { get; set; }
    }
}


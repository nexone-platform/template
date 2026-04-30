using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;

namespace HrService.Services
{
    public class TaxService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;

        public TaxService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
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
        public class TaxDeductionDto
        {
            public int TaxDeductionId { get; set; }
            public int EmployeeId { get; set; }
            public string? EmployeeName { get; set; }
            public int? TaxDeductionTypeId { get; set; }
            public string? TaxDeductionTypeName { get; set; }
            public decimal DeductionAmount { get; set; }
            public DateTime DeductionDate { get; set; }
            public DateTime EffectiveDateStart { get; set; }
            public DateTime? EffectiveDateEnd { get; set; }
            public DateTime? CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public DateTime? UpdateDate { get; set; }
            public string? UpdateBy { get; set; }
            public string? ImgPath { get; set; }
            public string? Reason { get; set; }
        }

        public async Task<ApiResponse<TaxDeductionDto>> GetTaxDeductionsAsync()
        {
            try
            {
                var httpContext = _httpContextAccessor.HttpContext;

                var taxDeductions = await (from td in _context.TaxDeductions
                                           join e in _context.Employees on td.EmployeeId equals e.Id
                                           join tdt in _context.TaxDeductionTypes on td.TaxDeductionTypeId equals tdt.TaxDeductionTypeId into taxDeductionTypeJoin
                                           from tdt in taxDeductionTypeJoin.DefaultIfEmpty() // Left join for Tax Deduction Type
                                           select new TaxDeductionDto
                                           {
                                               TaxDeductionId = td.TaxDeductionId,
                                               EmployeeId = td.EmployeeId,
                                               EmployeeName = e.FirstNameEn + " " + e.LastNameEn, // Assuming EmployeeName exists
                                               TaxDeductionTypeId = td.TaxDeductionTypeId,
                                               TaxDeductionTypeName = tdt.TaxDeductionTypeNameEn ?? null,
                                               DeductionAmount = td.DeductionAmount,
                                               DeductionDate = td.DeductionDate,
                                               EffectiveDateStart = td.EffectiveDateStart,
                                               EffectiveDateEnd = td.EffectiveDateEnd,
                                               CreateDate = td.CreateDate,
                                               CreateBy = td.CreateBy,
                                               UpdateDate = td.UpdateDate,
                                               UpdateBy = td.UpdateBy,
                                               Reason = td.Reason,
                                               ImgPath = string.IsNullOrEmpty(e.ImgPath)
                                              ? null
                                              : e.ImgPath,
                                           }).ToListAsync();

                return new ApiResponse<TaxDeductionDto>
                {
                    Data = taxDeductions,
                    TotalData = taxDeductions.Count
                };
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "TaxDeductionService", "Username");
                throw;
            }
        }
        public class TaxDeductionTypeDto
        {
            public int TaxDeductionTypeId { get; set; }
            public string? TaxDeductionTypeNameTh { get; set; }
            public string? TaxDeductionTypeNameEn { get; set; }
            public string? TaxDeductionTypeCode { get; set; }
            public decimal MaxAmount { get; set; }
            public DateTime EffectiveDateStart { get; set; }
            public DateTime? EffectiveDateEnd { get; set; }
            public string? Username { get; set; } // User performing the operation
        }
        public async Task<string> CreateOrUpdateTaxDeductionTypeAsync(TaxDeductionTypeDto taxDeductionTypeDto)
        {
            var utcDateTime = DateTime.UtcNow;

            if (taxDeductionTypeDto.TaxDeductionTypeId > 0)
            {
                // Update existing tax deduction type
                var existingTaxDeductionType = await _context.TaxDeductionTypes
                    .FirstOrDefaultAsync(e => e.TaxDeductionTypeId == taxDeductionTypeDto.TaxDeductionTypeId);

                if (existingTaxDeductionType == null)
                {
                    throw new KeyNotFoundException($"Tax Deduction Type with ID {taxDeductionTypeDto.TaxDeductionTypeId} not found.");
                }

                existingTaxDeductionType.UpdateBy = taxDeductionTypeDto.Username;
                existingTaxDeductionType.UpdateDate = utcDateTime;
                existingTaxDeductionType.CreateDate = existingTaxDeductionType.CreateDate.Value.ToUniversalTime();
                existingTaxDeductionType.TaxDeductionTypeNameEn = taxDeductionTypeDto.TaxDeductionTypeNameEn;
                existingTaxDeductionType.TaxDeductionTypeNameTh = taxDeductionTypeDto.TaxDeductionTypeNameTh;
                existingTaxDeductionType.TaxDeductionTypeCode = taxDeductionTypeDto.TaxDeductionTypeCode;
                existingTaxDeductionType.MaxAmount = taxDeductionTypeDto.MaxAmount;
                existingTaxDeductionType.EffectiveDateStart = taxDeductionTypeDto.EffectiveDateStart.ToUniversalTime();
                existingTaxDeductionType.EffectiveDateEnd = taxDeductionTypeDto.EffectiveDateEnd.Value.ToUniversalTime();

                _context.TaxDeductionTypes.Update(existingTaxDeductionType);
            }
            else
            {
                // Add new tax deduction type
                var newTaxDeductionType = new TaxDeductionType
                {
                    TaxDeductionTypeNameTh = taxDeductionTypeDto.TaxDeductionTypeNameTh,
                    TaxDeductionTypeNameEn = taxDeductionTypeDto.TaxDeductionTypeNameEn,
                    TaxDeductionTypeCode = taxDeductionTypeDto.TaxDeductionTypeCode,
                    MaxAmount = taxDeductionTypeDto.MaxAmount,
                    CreateDate = utcDateTime,
                    CreateBy = taxDeductionTypeDto.Username,
                    IsActive = true,
                    EffectiveDateStart = taxDeductionTypeDto.EffectiveDateStart,
                    EffectiveDateEnd = taxDeductionTypeDto.EffectiveDateEnd
                };

                _context.TaxDeductionTypes.Add(newTaxDeductionType);
            }

            await _context.SaveChangesAsync();
            return "Tax Deduction Type saved successfully.";
        }

        public class TaxDeductionDTO
        {
            public int TaxDeductionId { get; set; }
            public int EmployeeId { get; set; }
            public int TaxDeductionTypeId { get; set; }
            public decimal DeductionAmount { get; set; }
            public DateTime DeductionDate { get; set; } = DateTime.UtcNow;
            public string? Username { get; set; }
            public DateTime EffectiveDateStart { get; set; } = DateTime.UtcNow;
            public string? Reason { get; set; }
            public DateTime? EffectiveDateEnd { get; set; }
        }

        public async Task<string> SaveTaxDeductionAsync(TaxDeductionDTO taxDeductionDto)
        {
            if (taxDeductionDto == null)
            {
                throw new ArgumentNullException(nameof(taxDeductionDto), "TaxDeductionDTO cannot be null.");
            }

            if (taxDeductionDto.TaxDeductionId > 0)
            {
                // Update existing tax deduction
                var existingTaxDeduction = await _context.TaxDeductions
                    .FirstOrDefaultAsync(td => td.TaxDeductionId == taxDeductionDto.TaxDeductionId);

                if (existingTaxDeduction == null)
                {
                    throw new KeyNotFoundException($"TaxDeduction with ID {taxDeductionDto.TaxDeductionId} not found.");
                }

                // Update fields
                existingTaxDeduction.EmployeeId = taxDeductionDto.EmployeeId;
                existingTaxDeduction.TaxDeductionTypeId = taxDeductionDto.TaxDeductionTypeId;
                existingTaxDeduction.DeductionAmount = taxDeductionDto.DeductionAmount;
                existingTaxDeduction.DeductionDate = taxDeductionDto.DeductionDate.ToUniversalTime();
                existingTaxDeduction.EffectiveDateStart = taxDeductionDto.EffectiveDateStart.ToUniversalTime();
                existingTaxDeduction.CreateDate = existingTaxDeduction.CreateDate.Value.ToUniversalTime();
                existingTaxDeduction.EffectiveDateEnd = taxDeductionDto.EffectiveDateEnd.Value.ToUniversalTime();
                existingTaxDeduction.UpdateDate = DateTime.UtcNow;
                existingTaxDeduction.UpdateBy = taxDeductionDto.Username;
                existingTaxDeduction.Reason = taxDeductionDto.Reason;

                _context.TaxDeductions.Update(existingTaxDeduction);
            }
            else
            {
                // Create new tax deduction
                var newTaxDeduction = new TaxDeduction
                {
                    EmployeeId = taxDeductionDto.EmployeeId,
                    TaxDeductionTypeId = taxDeductionDto.TaxDeductionTypeId,
                    DeductionAmount = taxDeductionDto.DeductionAmount,
                    DeductionDate = taxDeductionDto.DeductionDate.ToUniversalTime(),
                    EffectiveDateStart = taxDeductionDto.EffectiveDateStart.ToUniversalTime(),
                    EffectiveDateEnd = taxDeductionDto.EffectiveDateEnd?.ToUniversalTime(),
                    CreateDate = DateTime.UtcNow,
                    CreateBy = taxDeductionDto.Username,
                    UpdateDate = DateTime.UtcNow,
                    UpdateBy = taxDeductionDto.Username,
                    Reason = taxDeductionDto.Reason,
                };

                _context.TaxDeductions.Add(newTaxDeduction);
            }


            await _context.SaveChangesAsync();
            return "Tax Deduction saved successfully.";
        }

        public class IncomeTaxBracketDTO
        {
            public int IncomeTaxBracketId { get; set; }
            public decimal MinIncome { get; set; }
            public decimal? MaxIncome { get; set; }
            public decimal TaxRate { get; set; }
            public DateTime EffectiveDateStart { get; set; } = DateTime.UtcNow;
            public DateTime? EffectiveDateEnd { get; set; }
            public string? Username { get; set; }
            public string? Reason { get; set; }
        }
        public async Task<string> SaveIncomeTaxBracketAsync(IncomeTaxBracketDTO incomeTaxBracketDto)
        {
            if (incomeTaxBracketDto == null)
            {
                throw new ArgumentNullException(nameof(incomeTaxBracketDto), "IncomeTaxBracketDTO cannot be null.");
            }

            if (incomeTaxBracketDto.IncomeTaxBracketId > 0)
            {
                // Update existing income tax bracket
                var existingBracket = await _context.IncomeTaxBrackets
                    .FirstOrDefaultAsync(itb => itb.IncomeTaxBracketId == incomeTaxBracketDto.IncomeTaxBracketId);

                if (existingBracket == null)
                {
                    throw new KeyNotFoundException($"IncomeTaxBracket with ID {incomeTaxBracketDto.IncomeTaxBracketId} not found.");
                }

                // Update fields
                existingBracket.MinIncome = incomeTaxBracketDto.MinIncome;
                existingBracket.MaxIncome = incomeTaxBracketDto.MaxIncome;
                existingBracket.TaxRate = incomeTaxBracketDto.TaxRate;
                existingBracket.EffectiveDateStart = incomeTaxBracketDto.EffectiveDateStart.ToUniversalTime();
                existingBracket.EffectiveDateEnd = incomeTaxBracketDto.EffectiveDateEnd?.ToUniversalTime();
                existingBracket.UpdateDate = DateTime.UtcNow;
                existingBracket.UpdatedBy = incomeTaxBracketDto.Username;
                existingBracket.Reason = incomeTaxBracketDto.Reason;
                existingBracket.CreateDate = existingBracket.CreateDate.Value.ToUniversalTime();
                _context.IncomeTaxBrackets.Update(existingBracket);
            }
            else
            {
                // Create new income tax bracket
                var newBracket = new IncomeTaxBracket
                {
                    MinIncome = incomeTaxBracketDto.MinIncome,
                    MaxIncome = incomeTaxBracketDto.MaxIncome,
                    TaxRate = incomeTaxBracketDto.TaxRate,
                    EffectiveDateStart = incomeTaxBracketDto.EffectiveDateStart.ToUniversalTime(),
                    EffectiveDateEnd = incomeTaxBracketDto.EffectiveDateEnd?.ToUniversalTime(),
                    CreateDate = DateTime.UtcNow,
                    CreatedBy = incomeTaxBracketDto.Username,
                    UpdateDate = DateTime.UtcNow,
                    UpdatedBy = incomeTaxBracketDto.Username,
                    Reason = incomeTaxBracketDto.Reason,
                };

                _context.IncomeTaxBrackets.Add(newBracket);
            }

            await _context.SaveChangesAsync();
            return "Income Tax Bracket saved successfully.";
        }
    }
}

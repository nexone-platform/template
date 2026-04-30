using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("hr-tb-ms-tax-deduction-type")]
    public class TaxDeductionType
    {
        public int TaxDeductionTypeId { get; set; } // Primary Key
        public string? TaxDeductionTypeNameTh { get; set; }
        public string? TaxDeductionTypeNameEn { get; set; }
        public string? TaxDeductionTypeCode { get; set; }
        public decimal MaxAmount { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public DateTime EffectiveDateStart { get; set; } = DateTime.UtcNow;
        public DateTime? EffectiveDateEnd { get; set; }

    }
}

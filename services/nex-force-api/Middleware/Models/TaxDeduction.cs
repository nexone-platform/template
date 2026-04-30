using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("hr-tb-tr-tax-deduction")]
    public class TaxDeduction
    {
        public int TaxDeductionId { get; set; } // Primary Key
        public int EmployeeId { get; set; }
        public int TaxDeductionTypeId { get; set; }
        public decimal DeductionAmount { get; set; }
        public DateTime DeductionDate { get; set; } = DateTime.UtcNow;
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public DateTime EffectiveDateStart { get; set; } = DateTime.UtcNow;
        public DateTime? EffectiveDateEnd { get; set; }
        public string? Reason { get; set; }
    }
}

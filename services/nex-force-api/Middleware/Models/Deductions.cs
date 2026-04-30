using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Middlewares.Constant.StatusConstant;

namespace Middlewares.Models
{
    [Table("hr-tb-ms-deduction")]
    public class Deduction
    {
        public int DeductionId { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public string? DeductionName { get; set; }
        public string? DeductionCode { get; set; }
        public bool IsActive { get; set; } = true;
        public decimal? UnitAmount { get; set; } // Corresponds to "unit_amount"
        public decimal? PercentAmount { get; set; } // Corresponds to "percent_amount"

        public DeductionTypeEnum? DeductionType { get; set; }
    }
}

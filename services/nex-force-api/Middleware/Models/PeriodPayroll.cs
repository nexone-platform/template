using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Middlewares.Constant.StatusConstant;

namespace Middlewares.Models
{
    [Table("hr-tb-tr-period")]
    public class PeriodPayroll
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
        public PeriodStatus? Status { get; set; }
        public DateTime? PaymentDate { get; set; }
        public PaymentChannel? PaymentChannel { get; set; }
        public int? PaymentTypeId { get; set; }
        public string? Reason { get; set; }
    }
}

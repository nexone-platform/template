using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using static Middlewares.Constant.StatusConstant;

namespace Middlewares.Models
{
      [Table("hr-tb-tr-personal-deduction")]
    public class PersonalDeduction
    {
        public int PersonalDeductionId { get; set; } 
        public decimal EmployeeId { get; set; } 
        public string? DeductionName { get; set; }
        public decimal DeductionAmount { get; set; } 
        public DateTime DeductionDate { get; set; }
        public DateTime MonthYear { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public int PayrollId { get; set; }
        public DeductionTypeEnum DeductionType { get; set; }
    }
}

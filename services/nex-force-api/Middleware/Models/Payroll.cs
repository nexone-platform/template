using Middleware.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Middlewares.Constant.StatusConstant;

namespace Middlewares.Models
{
    [Table("hr-tb-tr-payroll")]
    public class Payroll
    {
        public int PayrollId { get; set; }
        public decimal EmployeeId { get; set; } 
        public DateTime MonthYear { get; set; }  
        public decimal Salary { get; set; }
        public decimal TotalAdditions { get; set; }
        public decimal TotalDeductions { get; set; } 
        public decimal NetSalary { get; set; }
        public DateTime CreateDate { get; set; } 
        public string? CreateBy { get; set; } 
        public DateTime? UpdateDate { get; set; }  
        public string? UpdateBy { get; set; }
        public string? Remark { get; set; }
        public string? PayrollCode { get; set; }
        public DateTime? PayDate { get; set; }
        public int PeriodId { get; set; }
        public PeriodStatus? PaymentStatus { get; set; }
        public decimal? SocialSecurity { get; set; }
        public decimal? Tax401 { get; set; }
        public decimal? Tax402 { get; set; }
        public decimal? SocialSecurityRate { get; set; }

    }
}

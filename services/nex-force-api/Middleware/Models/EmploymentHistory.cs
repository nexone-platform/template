using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-hs-employment")]
    public class EmploymentHistory
    {
        public int HistoryId { get; set; } // Primary Key
        public int EmploymentId { get; set; } // Maps to employment_id
        public decimal EmployeeId { get; set; } // Maps to employee_id
        public int? DesignationId { get; set; } // Maps to designation_id
        public decimal Salary { get; set; } // Maps to salary
        public DateTime EffectiveDateStart { get; set; } // Maps to effective_date_start
        public DateTime EffectiveDateEnd { get; set; } // Maps to effective_date_end
        public DateTime CreateDate { get; set; } // Maps to create_date
        public string? CreateBy { get; set; } // Maps to create_by
        public int? EmployeeTypeId { get; set; }
        public int? PaymentTypeId { get; set; }
    }
}

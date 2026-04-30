using Middleware.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models {

    [Table("emp-tb-ms-employment")]
    public class Employment
    {
        public int EmploymentId { get; set; } // Maps to employment_id
        public decimal EmployeeId { get; set; } // Maps to employee_id
        public int? DesignationId { get; set; } // Maps to designation_id
        public decimal Salary { get; set; } // Maps to salary
        public DateTime? EffectiveDate { get; set; } // Maps to effective_date
        public DateTime? CreateDate { get; set; } // Maps to create_date
        public string? CreateBy { get; set; } // Maps to create_by
        public DateTime? UpdateDate { get; set; } // Maps to update_date
        public string? UpdateBy { get; set; } // Maps to update_by
        public Designation? Designation { get; set; }
        public int? EmployeeTypeId { get; set; }
        public int? PaymentTypeId { get; set; }
    }
}

using Middleware.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Middlewares.Models
{
    [Table("hr-tb-ms-deduction-assignment")]
    public class DeductionEmployeeAssignment
    {
        public int AssignmentId { get; set; }
        public int DeductionId { get; set; }
        public int AssignmentType { get; set; }// Default type
        public int? EmployeeId { get; set; } // Optional for specific assignment
        public int? DepartmentId { get; set; } // Optional for department assignment
        public int ExceptedEmployeeIds { get; set; } // Optional for 'excepted' type
        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public int? ProjectId { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
    }
}

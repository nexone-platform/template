using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-ms-project-assignments")]
    public class ProjectAssignment
    {
        [Key]
        public int AssignmentId { get; set; }

        public int ProjectId { get; set; }

        public int EmployeeId { get; set; }

        public string? RoleType { get; set; } = "MEMBER"; // LEADER | MEMBER

        public bool? IsActive { get; set; } = true;

        public DateTime? AssignedDate { get; set; } = DateTime.Now;

        public DateTime? CreateDate { get; set; }

        public string? CreateBy { get; set; }

        public DateTime? UpdateDate { get; set; }

        public string? UpdateBy { get; set; }
    }
}

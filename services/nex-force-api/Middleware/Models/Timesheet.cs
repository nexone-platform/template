using Middleware.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-tr-timesheet-header")]
    public class Timesheet
    {
        public int TimesheetHeaderId { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public string? OrganizationCode { get; set; }
        public int EmployeeId { get; set; }
        public int ProjectId { get; set; }
        public DateTime? ProjectDeadline { get; set; }
        public DateTime WorkDate { get; set; }
        public string? JobType { get; set; }
        public decimal? TotalWorkHours { get; set; }
        public decimal? TotalOtHours { get; set; }

        // Navigation property
        public ICollection<TimesheetDetail> Details { get; set; } = new List<TimesheetDetail>();

    }
}

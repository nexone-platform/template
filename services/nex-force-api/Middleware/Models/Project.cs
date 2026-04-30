using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-ms-projects")]
    public class Project
    {
        public int ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public int? Client { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Rate { get; set; }
        public string? RateType { get; set; }
        public string? Priority { get; set; }
        public int? ProjectLeader { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public string? Team { get; set; }
        public DateTime? CreateDate { get; set; }             // Creation date
        public string? CreateBy { get; set; }                 // Creator's name
        public DateTime? UpdateDate { get; set; }             // Update date
        public string? UpdateBy { get; set; }
        public decimal? ProjectTypeId { get; set; }
        public string? ProjectCode { get; set; }
        public string? InchargeName { get; set; }
        public string? Auditor { get; set; }
        public string? Approver { get; set; }
        public DateTime? IvDate { get; set; }
        public string? IvNo { get; set; }
        public string? PoNo { get; set; }
        public int? TimesheetDateStart { get; set; }
    }
}

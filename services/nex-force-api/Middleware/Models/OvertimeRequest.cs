using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-tr-overtime-request")]
    public class OvertimeRequest
    {
        public int OvertimeId { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public decimal EmployeeId { get; set; }
        public DateTime? OvertimeDate { get; set; }
        public decimal? Type { get; set; }
        public string? Description { get; set; }
        public bool IsApproved { get; set; } = false;
        public decimal? ApprovedId { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string? Comments { get; set; }
        public string? Status { get; set; }
        public decimal? Hour { get; set; }
        public decimal? Amount { get; set; }
        public bool IsFromTimesheet { get; set; }
        public string? OrganizationCode { get; set; }
        public decimal? RequestorId { get; set; }
        public int? ProjectId { get; set; }
        public int? RefId { get; set; }
        public int? CurrentApprovalLevel { get; set; }
    }
}

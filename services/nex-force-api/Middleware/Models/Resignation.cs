using Middleware.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;
namespace Middlewares.Models
{
    [Table("pm-tb-tr-resignations")]
    public class Resignation
    {
        public decimal ResignationId { get; set; }

        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public decimal EmployeeId { get; set; }
        public DateTime? NoticeDate { get; set; }
        public DateTime? ResignationDate { get; set; }
        public DateTime? RequestDate { get; set; }
        public string? Reason { get; set; }
        public bool IsApproved { get; set; } = false;
        public decimal? ApprovedId { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string? Comments { get; set; }
        public string? Status { get; set; }

        // Navigation property to Employee

        public int? RefId { get; set; }
        public int? CurrentApprovalLevel { get; set; }
    }
}

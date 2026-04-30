using Middleware.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;

namespace Middlewares.Models
{

    [Table("pm-tb-tr-promotions")]
    public class Promotion
    {
        public int PromotionId { get; set; }
        public decimal EmployeeId { get; set; }
        public int DesignationFromId { get; set; }
        public int DepartmentFromId { get; set; }
        public int DesignationToId { get; set; }
        public int DepartmentToId { get; set; }
        public DateTime PromotionDate { get; set; }
        public decimal OldSalary { get; set; }
        public decimal NewSalary { get; set; }
        public decimal ApproverId { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime? CreateDate { get; set; } = DateTime.UtcNow;
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string? Comments { get; set; }
        public int? RefId { get; set; }
        public int? CurrentApprovalLevel { get; set; }
    }
}

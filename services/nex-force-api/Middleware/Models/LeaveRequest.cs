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
    [Table("emp-tb-tr-leave-request")]
    public class LeaveRequest
    {
        public int LeaveRequestId { get; set; }
        public decimal EmployeeId { get; set; }
        public int LeaveTypeId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalDays { get; set; }
        public string? DayType { get; set; }
        public string? Reason { get; set; }
        public string? Comments { get; set; }
        public DateTime? RequestDate { get; set; }
        public string? Status { get; set; } = ApproveStatus.New.ToString();
        public decimal? ApproverId { get; set; }
        public int? CurrentApprovalLevel { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public int? RefId { get; set; }
    }
}

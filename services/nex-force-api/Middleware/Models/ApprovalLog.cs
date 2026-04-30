using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("app-tb-ms-approval-log")]
    public class ApprovalLog
    {
        public decimal ActionId { get; set; }  
        public int InstanceId { get; set; }
        public int? StepId { get; set; }
        public int? ApproverId { get; set; }
        public string? Action { get; set; }
        public DateTime? ActionDate { get; set; }
        public int? ReasonId { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("app-tb-ms-approval-status")]
    public class ApprovalStatus
    {
        public int InstanceId { get; set; }           // NOT NULL
        public string? RefType { get; set; }          // NULL
        public int? RefId { get; set; }               // NULLABLE -> int?
        public int? RuleId { get; set; }              // NULL
        public string? Status { get; set; }           // NULLABLE -> string?
        public int? RequestedBy { get; set; }
        public DateTime? RequestedAt { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public int? RefRequestId { get; set; }        // NULLABLE -> int?
        public int? CurrentStepOrder { get; set; }    // NULLABLE -> int?
    }
}

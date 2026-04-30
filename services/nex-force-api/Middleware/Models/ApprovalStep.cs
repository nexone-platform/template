using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("app-tb-ms-approval-step")]
    public class ApprovalStep
    {
        public int StepId { get; set; }                   // step_id NOT NULL
        public int? RuleId { get; set; }                  // rule_id NULL
        public int? StepOrder { get; set; }               // step_order NULL -> ต้อง int?
        public string? Position { get; set; }             // varchar NULL
        public decimal? MinAmount { get; set; }           // numeric NULL
        public decimal? MaxAmount { get; set; }           // numeric NULL
        public string? Department { get; set; }           // varchar NULL
        public bool IsParallel { get; set; }              // bool NOT NULL
        public int? ThresholdCount { get; set; }          // int NULL
        public decimal? ApproverId { get; set; }          // int NULL -> ใช้ decimal? ตาม DB
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public int? RefId { get; set; }                   // ref_id NULL -> int? 
        public decimal? RoleId { get; set; }             // numeric NULL
        public int? DesignationId { get; set; }          // int NULL
        //public bool IsActive { get; set; }
    }
}

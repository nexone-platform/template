using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
 
    [Table("adm-tb-ms-schedule-timing")] 
    public class ScheduleTiming
    {
        [Key]
        public int? ScheduleId { get; set; }
        public int? ManageResumeId { get; set; }
        public int? JobTitleId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? ExpiredDate { get; set; }
        public string? Status { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; } // Maps to organization_id

    }
    
}

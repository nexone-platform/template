using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
 
    [Table("adm-tb-ms-interview-result")] 
    public class InterviewResult
    {
        [Key]
        public int? InterviewResultId { get; set; }
        public int? ManageResumeId { get; set; }
        public int? ScheduleId { get; set; }
        public int? DepartmentId { get; set; }
        public DateTime? DateInternal { get; set; }
        public DateTime? DateExternal { get; set; }
        public string? StatusInternal { get; set; }
        public string? StatusExternal { get; set; }
        public string? Comment { get; set; }
        public string? Step { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; } // Maps to organization_id

    }
    
}

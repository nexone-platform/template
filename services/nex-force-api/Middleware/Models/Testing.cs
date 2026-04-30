using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
 
    [Table("adm-tb-ms-testing")] 
    public class Testing
    {
        [Key]
        public int? TestingId { get; set; }
        public int? ManageResumeId { get; set; }
        public int? CategoryId { get; set; }
        public string? AnswersJson { get; set; }
        public int? Score { get; set; }
        public DateTime? Time { get; set; }
        public int? SpentSeconds { get; set; }
        public string? Status { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; } // Maps to organization_id

    }
    
}

using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
 
    [Table("adm-tb-ms-manage-applicant-testing")] 
    public class ManageApplicantTesting
    {
        [Key]
        public int? ManageApplicantTestingId { get; set; }
        public int? ManageResumeId { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoriesJson { get; set; }
        public string? Status { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; } // Maps to organization_id

    }
    
}

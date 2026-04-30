using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
 
    [Table("adm-tb-ms-manage-resume")] 
    public class ManageResume
    {
        [Key]
        public int? ManageResumeId { get; set; }
        public int? Title { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Gender { get; set; }
        public int? Position { get; set; }
        public int? Location { get; set; }
        public string? Skills { get; set; }
        public string? Experiences { get; set; }
        public string? Educations { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; } // Maps to organization_id

    }
    
}

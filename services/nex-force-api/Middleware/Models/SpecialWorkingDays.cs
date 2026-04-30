using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
 
    [Table("emp-tb-ms-special-days")] 
    public class SpecialWorkingDays
    {
        [Key]
        public int SpecialDaysId { get; set; }
        public string? TitleTh { get; set; }
        public string? TitleEn { get; set; }
        public DateTime SpecialDate { get; set; }

        public string? Day{ get; set; }
        public bool IsAnnual { get; set; }

        public bool IsActive { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public string? OrganizationCode { get; set; } // Maps to organization_id
       // public Organization? Organizations { get; set; } // Navigation property
    }
    
}

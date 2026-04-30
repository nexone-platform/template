using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
 
    [Table("emp-tb-ms-holidays")] 
    public class Holiday
    {
        [Key]
        public int? HolidayId { get; set; }
        public string? TitleTh { get; set; }
        public string? TitleEn { get; set; }
        public DateTime HolidayDate { get; set; }

        public string? Day{ get; set; }
        public bool IsAnnual { get; set; }

        public bool IsActive { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public string? OrganizationCode { get; set; } // Maps to organization_id
    }
    
}

using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
 
    [Table("adm-tb-ms-manage-jobs")] 
    public class ManageJobs
    {
        [Key]
        public int? ManageJobId { get; set; }
        public string? JobTitle { get; set; }
        public int? Department { get; set; }
        public int? JobLocation { get; set; }
        public int? EmploymentType { get; set; }
        public string? Description { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? PortfolioUrl { get; set; }
        public string? Experience { get; set; }
        public int? SalaryFrom { get; set; }
        public int? SalaryTo { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? ExpiredDate { get; set; }
        public int? Position { get; set; }
        public string? Age { get; set; }
        public string? Qualification { get; set; }
        public string? Status { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; } // Maps to organization_id

    }
    
}

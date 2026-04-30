using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("hr-tb-ms-social-security-rates")]
    public class SocialSecurityRate
    {
        public int SocialSecurityId { get; set; }  
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Percentage { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public decimal? MaxDeduction { get; set; }
        public decimal? MaxSalary { get; set; }
        public DateTime? CreateDate { get; set; }  
        public string? CreateBy { get; set; } 
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
    }

}
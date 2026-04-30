
using System.ComponentModel.DataAnnotations.Schema;


namespace Middleware.Models
{
    [Table("emp-tb-tr-otp")]
    public class EmployeeOtp 
    { 
        public int OtpId { get; set; }
        public string? Otp { get; set; }
        public string? EmployeeId { get; set; }
        public string? Email { get; set; }
        public DateTime? Expiry { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
    
    }
}

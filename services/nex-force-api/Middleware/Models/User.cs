using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("auth-tb-ms-user")]
    public class User
    {
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public int UserId { get; set; } // Adjust the type if necessary
        public string EmployeeId { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public decimal? RoleId { get; set; }
        public string? Salt { get; set; }
        public string? BackUpPassword { get; set; }
        public bool? IsActive { get; set; }
        public string? LineUserId { get; set; }
        public string? LineToken { get; set; }
    }
}

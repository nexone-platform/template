using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace Middleware.Models
{
    [Table("adm-tb-ms-roles")]
    public class Role
    {
        public decimal? RoleId { get; set; }
        public string? RoleName { get; set; }
        public DateTime CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime UpdateDate { get; set; }
        public int? DepartmentId { get; set; }
        public string? UpdateBy { get; set; }  
    }
}

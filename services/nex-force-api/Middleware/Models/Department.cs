using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
    [Table("emp-tb-ms-department")]
    public class Department
    {
        public int DepartmentId { get; set; }
        public string? DepartmentNameTh { get; set; }
        public string? DepartmentNameEn { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public string? DepartmentCode { get; set; }
    }
}

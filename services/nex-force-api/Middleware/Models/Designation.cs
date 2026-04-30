using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
    [Table("emp-tb-ms-designation")]
    public class Designation
    {
        public int DesignationId { get; set; }
        public string? DesignationNameTh { get; set; }
        public string? DesignationNameEn { get; set; }
        public string? DesignationCode { get; set; }
        public int? DepartmentId { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
       
    }
}

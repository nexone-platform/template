using System.ComponentModel.DataAnnotations.Schema;

namespace Middleware.Models
{
    [Table("emp-tb-ms-leave-type")]
    public class LeaveType { 
        public int LeaveTypeId { get; set; } // leave_type_id
        public string? LeaveTypeNameTh { get; set; } // leave_type_name
        public string? LeaveTypeNameEn { get; set; } // leave_type_name
        public bool IsActive { get; set; } = true; // isactive
        public string? LeaveTypeCode { get; set; } 
        public DateTime? CreateDate { get; set; } // create_date
        public string? CreateBy { get; set; } // create_by
        public DateTime? UpdateDate { get; set; } // update_date
        public string? UpdateBy { get; set; } // update_by
    
    }
}

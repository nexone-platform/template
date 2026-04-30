using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    public class EmployeeType
    {
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public int EmployeeTypeId { get; set; } // Primary Key
        public string EmployeeTypeNameTh { get; set; } = null!;
        public string EmployeeTypeNameEn { get; set; } = null!;
        public string? EmployeeTypeCode { get; set; }
        public bool? IsActive { get; set; }
    }
}

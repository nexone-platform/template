using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-ms-overtime-type")]
    public class OtType { 
        public int OtTypeId { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public string? OtTypeNameTh { get; set; }
        public bool IsActive { get; set; } = true;
        public string? OtTypeNameEn { get; set; }
        public string? OtTypeCode { get; set; }
        public decimal? Value { get; set; }
    }
}

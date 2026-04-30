using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("pm-tb-ms-terminate-type")]
    public class TerminateType
    {
        public int TerminateTypeId { get; set; }
        public string? TerminateTypeNameTh { get; set; }
        public string? TerminateTypeNameEn { get; set; }
        public string? TerminateTypeCode { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
    }
}

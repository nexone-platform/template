using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("pm-tb-tr-terminate")]
    public class Terminate
    {
        public int TerminateId { get; set; }
        public int TerminateTypeId { get; set; }
        public decimal EmployeeId { get; set; }
        public DateTime? NoticeDate { get; set; }
        public DateTime? TerminateDate { get; set; }
        public string? Reason { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public int? RefId { get; set; }
    }
}

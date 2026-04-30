using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-ms-task")]
    public class Tasks
    {
        public int TaskId { get; set; }
        public string? TaskNameTh { get; set; }
        public string? TaskNameEn { get; set; }
        public string? TaskCode { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
    }
 

}

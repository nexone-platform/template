using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-ms-project-type")]
    public class ProjectType
    {
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public bool? IsActive { get; set; }
        public int? ProjectTypeId { get; set; }
        public string? ProjectTypeNameTh { get; set; }
        public string? ProjectTypeNameEn { get; set; }
        public string? ProjectTypeCode { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;

namespace Middlewares.Models
{
    [Table("emp-tb-ms-marital-status")]
    public class MaritalStatus
    {
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public int MaritalStatusId { get; set; }
        public string? MaritalStatusName { get; set; }
        public string? MaritalStatusCode { get; set; }
    }
}

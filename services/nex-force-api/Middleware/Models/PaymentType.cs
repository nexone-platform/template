using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    public class PaymentType
    {
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public int PaymentTypeId { get; set; } // Primary Key
        public string PaymentTypeNameTh { get; set; } = null!;
        public string PaymentTypeNameEn { get; set; } = null!;
        public string? PaymentTypeCode { get; set; }
        public bool? IsActive { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("adm-tb-ms-bank")]
    public class Bank
    {
        public int BankId { get; set; }
        public string? BankCode { get; set; }
        public string? BankNameTh { get; set; }
        public string? BankNameEn { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public string? Abbreviation { get; set; }
    }
}

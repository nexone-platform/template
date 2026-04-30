using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("hr-tb-ms-tax-income-tax-brackets")]
    public class IncomeTaxBracket
    {

        public int IncomeTaxBracketId { get; set; }

        public DateTime? CreateDate { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdatedBy { get; set; }
        public bool? IsActive { get; set; } = true;
        public decimal? MinIncome { get; set; }
        public decimal? MaxIncome { get; set; }
        public decimal? TaxRate { get; set; }
        public DateTime? EffectiveDateStart { get; set; }
        public DateTime? EffectiveDateEnd { get; set; }
        public string? Reason { get; set; }
    }
}

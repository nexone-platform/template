using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Middlewares.Constant.StatusConstant;

namespace Middlewares.Models
{
    [Table("hr-tb-ms-additions")]
    public class Additions
    {
        public int AdditionsId { get; set; } // Primary Key
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
        public string? AdditionsName { get; set; }
        public string? AdditionsCode { get; set; }
        public string? AdditionsCategory { get; set; }
        public bool? IsActive { get; set; }
        public decimal? UnitAmount { get; set; }
        public decimal? PercentAmount { get; set; }
        public AdditionTypeEnum? AdditionType { get; set; }

    }
}

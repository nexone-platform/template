using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-ms-project-cost-detail")]
    public class ProjectCostDetail
    {
        public int CostDetailId { get; set; }

        public int CostId { get; set; }

        public int ProjectId { get; set; }

        public int EmployeeId { get; set; }

        public string? RoleName { get; set; }

        public decimal? CostPerDay { get; set; }

        public decimal? MdProject { get; set; }

        public decimal? TotalCost { get; set; }

        public decimal? MdUsed { get; set; }

        public decimal? RemainMd { get; set; }

        public decimal? ExtraCost { get; set; }

        public DateTime? CreateDate { get; set; }

        public string? CreateBy { get; set; }

        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }

    }
}

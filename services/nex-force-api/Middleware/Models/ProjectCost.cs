using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-ms-project-cost")]
    public class ProjectCost
    {

        public int CostId { get; set; }

        public int ProjectId { get; set; }

        public decimal? BudgetProject { get; set; }

        public decimal? TotalCost { get; set; }


        public decimal? MdPerMonth { get; set; }


        public DateTime? CreateDate { get; set; }


        public string? CreateBy { get; set; }


        public DateTime? UpdateDate { get; set; }

        public string? UpdateBy { get; set; }

    }

}

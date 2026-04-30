using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("adm-tb-ms-asset-category")]
    public class AssetCategory
    {
        public int CategoryId { get; set; } // maps to category_id
        public string? CategoryName { get; set; } // maps to category_name
        public DateTime? CreatedOn { get; set; } // maps to created_on
        public string? Img { get; set; } // maps to img
        public DateTime? CreateDate { get; set; }             // Creation date
        public string? CreateBy { get; set; }                 // Creator's name
        public DateTime? UpdateDate { get; set; }             // Update date
        public string? UpdateBy { get; set; }
    }
}

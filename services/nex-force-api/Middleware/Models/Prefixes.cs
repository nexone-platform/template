using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
 
    [Table("adm-tb-ms-prefixes")] 
    public class Prefixes
    {
        [Key]
        public int? PrefixId { get; set; }
        public string? PrefixKey { get; set; }
        public string? PrefixLabel { get; set; }
        public string? PrefixValue { get; set; }
        public int? SeqShow { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; } // Maps to organization_id
    }
    
}

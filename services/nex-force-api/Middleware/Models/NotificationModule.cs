using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
 
    [Table("adm-tb-ms-notification-module")] 
    public class NotificationModule
    {
        [Key]
        public int? ModuleId { get; set; }
        public string? Module { get; set; }
        public string? Description { get; set; }
        public int? SeqShow { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; } // Maps to organization_id

    }
    
}

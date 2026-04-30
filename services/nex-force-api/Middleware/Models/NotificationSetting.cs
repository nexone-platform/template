using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
 
    [Table("adm-tb-ms-notification-setting")] 
    public class NotificationSetting
    {
        [Key]
        public int? NotiId { get; set; }
        public int? ProgramId { get; set; }
        public int? ModuleId { get; set; }
        public int? ChanelId { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; } // Maps to organization_id

    }
    
}

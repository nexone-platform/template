using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("adm-tb-ms-email-setting")]
    public class EmailSetting
    {
        public int EmailId { get; set; }
        public bool IsEnabled { get; set; }
        public string Method { get; set; } = "SMTP";

        public string? SmtpServer { get; set; }
        public string? SmtpLogin { get; set; }
        public string? SmtpPassword { get; set; }
        public string? SmtpPort { get; set; }
        public string? FromName { get; set; }
        public string? FromEmail { get; set; }

        public string? ToName { get; set; }
        public string? ToEmail { get; set; }

        public bool IsActive { get; set; }

        public DateTime CreateDate { get; set; } = DateTime.UtcNow;
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
    }
}

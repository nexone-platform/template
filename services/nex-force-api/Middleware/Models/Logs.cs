using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("logs")]
    public class Logs
    {
        public int Id { get; set; }
        public string? ErrorMessageTh { get; set; } // Error message in Thai
        public string? ErrorMessageEn { get; set; } // Error message in English
        public string? PageName { get; set; } // Page where error occurred
        public DateTime CreateDate { get; set; } // Date of log creation
        public string? CreateBy { get; set; } // User who created the log
    }
}

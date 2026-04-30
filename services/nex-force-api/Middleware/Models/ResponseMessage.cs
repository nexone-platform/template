using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Middlewares.Models
{
    [Table("adm-tb-ms-response-messages")]
    public class ResponseMessage
    {
        public int MessageId { get; set; }
        public string LanguageCode { get; set; }
        public string MessageKey { get; set; }
        public string Category { get; set; } // success, error, warning, confirm, info
        public string Title { get; set; }
        public string Message { get; set; }
        public bool IsActive { get; set; }

        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
    }
}

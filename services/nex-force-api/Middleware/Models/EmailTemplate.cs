using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("adm-tb-ms-email-template")]
    public class EmailTemplate
    {
        public int TemplateId { get; set; }
        public string TemplateCode { get; set; }
        public string? Title { get; set; }
        public string? LanguageCode { get; set; }
        public string? EmailContent { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
    }
}

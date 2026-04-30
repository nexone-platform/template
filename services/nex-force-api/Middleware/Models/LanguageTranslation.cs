using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("adm-tb-ms-language-translations")]
    public class LanguageTranslation
    {
        public int TranslationsId { get; set; } 
        public string LanguageCode { get; set; }
        public string PageKey { get; set; }
        public string LabelKey { get; set; }
        public string LabelValue { get; set; }

        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
    }
}

using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
 
    [Table("adm-tb-ms-document-running-control")] 
    public class DocumentRunning
    {
        [Key]
        public int? DocumentId { get; set; }
        public string? DocumentType { get; set; }
        public string? Description { get; set; }
        public string? Prefix { get; set; }
        public string? FormatDate { get; set; }
        public string? Suffix { get; set; }
        public int? DigitNumber { get; set; }
        public int? Running { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; } // Maps to organization_id
    }
    
}

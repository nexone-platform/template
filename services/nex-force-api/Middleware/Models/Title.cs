using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Middleware.Models
{
    [Table("adm-tb-ms-title")]
    public class Title
    {
        public int TitleID { get; set; }
        public string? TitleNameTh { get; set; }
        public string? TitleNameEn { get; set; }
        public string? TitleNameCode { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-ms-project-files")]
    public class ProjectFile
    {
        public int FileId { get; set; }
        public int ProjectId { get; set; }
        public string FileCategory { get; set; } = null!; // IMAGE | DOCUMENT

        public string? OriginalName { get; set; }
        public string? StoredName { get; set; }
        public string? FilePath { get; set; }
        public long? FileSize { get; set; }
        public string? FileType { get; set; }

        public DateTime CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }



    }
}

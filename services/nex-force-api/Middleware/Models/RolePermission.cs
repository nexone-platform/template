using Middleware.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("role_permissions", Schema = "nex_core")]
    public class RolePermission
    {
        public int PermissionId { get; set; }
        public bool IsActive { get; set; } 

        public decimal? RoleId { get; set; }

        public int MenuId { get; set; }

        public bool CanView { get; set; } 

        public bool CanEdit { get; set; } 

        public bool CanAdd { get; set; } 

        public bool CanDelete { get; set; } 

        public bool CanImport { get; set; } 

        public bool CanExport { get; set; } 

        public DateTime? CreateDate { get; set; }

        public string? CreateBy { get; set; }

        public DateTime? UpdateDate { get; set; }

        public string? UpdateBy { get; set; }

        public string? AppName { get; set; }

        // Navigation Properties
        public virtual Role Role { get; set; }

        public virtual Menu Menu { get; set; }
    }

}

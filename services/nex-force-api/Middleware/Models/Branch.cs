using Middleware.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-ms-branch")]
    public class Branch
    {
        public int BranchId { get; set; }
        public string? BranchNameTh { get; set; }
        public string? BranchNameEn { get; set; }
        public string? BranchCode { get; set; }
        public int OrganizationId { get; set; }
        public string? Address { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? ContactPerson { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Fax { get; set; }
        public bool IsActive { get; set; } = true;
        public string? TaxNo { get; set; }
        public string? Logo { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }

        [ForeignKey("OrganizationId")]
        public virtual Organization? Organization { get; set; }
    }
}

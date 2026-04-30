using System.ComponentModel.DataAnnotations.Schema;

namespace Middleware.Models
{
    [Table("emp-tb-ms-organization")]
    public class Organization
    {
        public int? OrganizationId { get; set; } // Maps to organization_id
        public string? OrganizationNameTh { get; set; } // Maps to organization_name_th
        public string? OrganizationNameEn { get; set; } // Maps to organization_name_en
        public bool? IsActive { get; set; } = true; // Maps to isactive
        public DateTime? CreateDate { get; set; } // Maps to create_date
        public string? CreateBy { get; set; } // Maps to create_by
        public DateTime? UpdateDate { get; set; } // Maps to update_date
        public string? UpdateBy { get; set; } // Maps to update_by
        public string? OrganizationCode { get; set; }
        public string? Address { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? ContactPerson { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Fax { get; set; }
        public string? Url { get; set; }
        public string? Logo { get; set; }
        public string? Favicon { get; set; }
        public string? TaxNo { get; set; }
    }
}

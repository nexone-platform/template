using Middleware.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("adm-tb-ms-assets")]
    public class Asset
    {
        public int AssetId { get; set; }                     // Auto-incremented asset ID
        public string? AssetName { get; set; }                // Name of the asset (e.g., Dell Keyboard)
        public string? AssetModel { get; set; }
        public string? ProductNo { get; set; }
        public string? Type { get; set; }                     // Type of the asset (e.g., Wired Keyboard)
        public string? SerialNumber { get; set; }             // Serial number of the asset
        public string? Brand { get; set; }                    // Brand of the asset (e.g., Dell)
        public decimal? Cost { get; set; }                    // Cost of the asset
        public string? Location { get; set; }                 // Location of the asset
        public DateTime? WarrantyStart { get; set; }          // Warranty start date
        public DateTime? WarrantyEnd { get; set; }            // Warranty end date
        public string? Vendor { get; set; }                   // Vendor name
        public string? Category { get; set; }                 // Asset category
        public bool IsActive { get; set; }                    // Active status
        public DateTime? CreateDate { get; set; }             // Creation date
        public string? CreateBy { get; set; }                 // Creator's name
        public DateTime? UpdateDate { get; set; }             // Update date
        public string? UpdateBy { get; set; }
        public string? AssetImg1 { get; set; }
        public string? AssetImg2 { get; set; }
        public string? AssetImg3 { get; set; }
        public string? AssetImg4 { get; set; }
        public decimal? EmployeeId { get; set; }
        public DateTime? AssignedDate	 { get; set; }
        public string? AssetCode { get; set; }
        public string? Supplier { get; set; }
        public decimal? Warranty { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public string? Condition { get; set; }
        public virtual Employee? Employee { get; set; } // Navigation property
    }
}


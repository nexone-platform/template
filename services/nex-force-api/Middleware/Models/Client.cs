using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-ms-client")]
    public class Client
    {
        public DateTime? CreateDate { get; set; }   // Creation date
        public string? CreateBy { get; set; }        // Creator's name
        public DateTime? UpdateDate { get; set; }   // Update date
        public string? UpdateBy { get; set; }        // Updater's name
        public int? ClientId { get; set; }        // Auto-incrementing ID
        public string? ClientCode { get; set; }       // Client code
        public string? Company { get; set; }          // Company name
        public string? Address { get; set; }
        public string? TaxId { get; set; }
        public Boolean? HeadOffice { get; set; }     
        public string? BranchNo { get; set; }
        public string? BranchName { get; set; }
        public int? CreditTerm { get; set; }
        public string? OfficeNo { get; set; }
        public string? ImgPath { get; set; }
        public string? ContractName { get; set; }       // Client name
        public string? ContractNo { get; set; }  // Phone number
        public string? ContractEmail { get; set; }            
        public bool? IsActive { get; set; }

        
    }
}

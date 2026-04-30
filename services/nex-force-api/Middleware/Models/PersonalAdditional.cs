using Middleware.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Middlewares.Constant.StatusConstant;

namespace Middlewares.Models
{
    [Table("hr-tb-tr-personal-additional")]
    public class PersonalAdditional
    {
        public int PersonalAdditionId { get; set; }  // Primary key
        public decimal EmployeeId { get; set; }  // Foreign key to Employee
        public string? AdditionName { get; set; }  // Name of the addition
        public decimal AdditionAmount { get; set; }  // Amount of the addition
        public DateTime AdditionDate { get; set; }  // Date of the addition
        public DateTime MonthYear { get; set; }  // Month and year of the addition
        public bool IsActive { get; set; }  // Active status of the record
        public DateTime? CreateDate { get; set; }  // Creation timestamp
        public string? CreateBy { get; set; }  // Created by
        public DateTime? UpdateDate { get; set; }  // Last updated timestamp
        public string? UpdateBy { get; set; }  // Updated by

        public int PayrollId { get; set; }
        public AdditionTypeEnum AdditionType { get; set; }

    }
}

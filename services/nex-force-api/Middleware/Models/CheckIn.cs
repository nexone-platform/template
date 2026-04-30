using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{

    [Table("emp-tb-tr-check-ins")]
    public class CheckIn
    {
        public int CheckInId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
        public DateTime? BreakStartTime { get; set; }
        public DateTime? BreakEndTime { get; set; }
        public DateTime? CreateDate { get; set; }             // Creation date
        public string? CreateBy { get; set; }                 // Creator's name
        public DateTime? UpdateDate { get; set; }             // Update date
        public string? UpdateBy { get; set; }
        public double? CheckInLat { get; set; }
        public double? CheckInLong { get; set; }
        public double? CheckOutLat { get; set; }
        public double? CheckOutLong { get; set; }
    }
}

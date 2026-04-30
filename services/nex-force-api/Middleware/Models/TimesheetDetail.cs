using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    [Table("emp-tb-tr-timesheet-detail")]
    public class TimesheetDetail
    {
        public int TimesheetId { get; set; }
        public int TimesheetHeaderId { get; set; }

        public string WorkName { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public decimal? ActualHours { get; set; }
        public decimal? OtHours { get; set; }
        public decimal? WorkPercentage { get; set; }
        public int? TaskId { get; set; }
        public int? TaskBoardId { get; set; }
        public bool IsOt { get; set; } = true;
        public string? WorkDescription { get; set; }
        public string? ProblemDescription { get; set; }
        public string? ProblemResolve { get; set; }
        public string? AttFile { get; set; }
        public int? OtId { get; set; }

        // Navigation property
        public Timesheet? Timesheet { get; set; }
    }
}

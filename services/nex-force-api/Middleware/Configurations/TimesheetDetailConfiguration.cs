using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middlewares.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Configurations
{
    public class TimesheetDetailConfiguration : IEntityTypeConfiguration<TimesheetDetail>
    {
        public void Configure(EntityTypeBuilder<TimesheetDetail> builder)
        {

            builder.HasKey(e => e.TimesheetId);

            builder.Property(e => e.TimesheetId).HasColumnName("timesheet_id").HasDefaultValueSql("nextval('\"solution-one\".\"emp-sq-timesheet-id\"'::regclass)"); ;
            builder.Property(e => e.TimesheetHeaderId).HasColumnName("timesheet_header_id");
            builder.Property(e => e.WorkName).HasColumnName("work_name").HasMaxLength(100);
            builder.Property(e => e.StartTime).HasColumnName("start_time");
            builder.Property(e => e.EndTime).HasColumnName("end_time");
            builder.Property(e => e.ActualHours).HasColumnName("actual_hours");
            builder.Property(e => e.OtHours).HasColumnName("ot_hours");
            builder.Property(e => e.WorkPercentage).HasColumnName("work_percentage");
            builder.Property(e => e.TaskId).HasColumnName("task_id");
            builder.Property(e => e.IsOt).HasColumnName("is_ot");
            builder.Property(e => e.WorkDescription).HasColumnName("work_description");
            builder.Property(e => e.ProblemDescription).HasColumnName("problem_description");
            builder.Property(e => e.ProblemResolve).HasColumnName("problem_resolve");
            builder.Property(e => e.OtId).HasColumnName("ot_id");
            builder.Property(e => e.AttFile).HasColumnName("att_file");
        }
    }
}

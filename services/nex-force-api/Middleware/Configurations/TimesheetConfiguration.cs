using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middlewares.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SharpCompress.Common;

namespace Middlewares.Configurations
{
    public class TimesheetConfiguration : IEntityTypeConfiguration<Timesheet>
    {
        public void Configure(EntityTypeBuilder<Timesheet> builder)
        {
            builder.HasKey(e => e.TimesheetHeaderId);

            builder.Property(e => e.TimesheetHeaderId).HasColumnName("timesheet_header_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".\"emp-sq-timesheet-header-id\"'::regclass)");

            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by").HasMaxLength(50);
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by").HasMaxLength(50);
            builder.Property(e => e.OrganizationCode).HasColumnName("organization_code");
            builder.Property(e => e.EmployeeId).HasColumnName("employee_id");
            builder.Property(e => e.ProjectId).HasColumnName("project_id");
            builder.Property(e => e.ProjectDeadline).HasColumnName("project_deadline");
            builder.Property(e => e.WorkDate).HasColumnName("work_date");
            builder.Property(e => e.JobType).HasColumnName("job_type");
            builder.Property(e => e.TotalWorkHours).HasColumnName("total_work_hours");
            builder.Property(e => e.TotalOtHours).HasColumnName("total_ot_hours");

            builder.HasMany(h => h.Details)
                   .WithOne(d => d.Timesheet)
                   .HasForeignKey(d => d.TimesheetHeaderId)
                   .OnDelete(DeleteBehavior.Cascade);

        }
    }
}

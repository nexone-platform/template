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
    public class ProjectConfiguration : IEntityTypeConfiguration<Project>
    {
        public void Configure(EntityTypeBuilder<Project> builder)
        {
            // Specify primary key
            builder.HasKey(p => p.ProjectId);
            builder.Property(p => p.ProjectId)
                   .HasColumnName("project_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-project-id'::regclass)") // Use sequence for auto-incrementing ID
                   .IsRequired();

            // Column configurations
            builder.Property(p => p.ProjectName)
                   .HasColumnName("project_name")
                   .HasMaxLength(255)
                   .IsRequired();

            builder.Property(p => p.Client)
                   .HasColumnName("client")
                   .HasMaxLength(255);

            builder.Property(p => p.StartDate)
                   .HasColumnName("start_date");

            builder.Property(p => p.EndDate)
                   .HasColumnName("end_date");

            builder.Property(p => p.Rate)
                   .HasColumnName("rate");
                   

            builder.Property(p => p.RateType)
                   .HasColumnName("rate_type")
                   .HasMaxLength(50);

            builder.Property(p => p.Priority)
                   .HasColumnName("priority")
                   .HasMaxLength(50);

            builder.Property(p => p.ProjectLeader)
                   .HasColumnName("project_leader")
                   .HasMaxLength(255);
            builder.Property(p => p.Team)
                  .HasColumnName("team");

            builder.Property(p => p.Description)
                   .HasColumnName("description");

            // Audit fields
            builder.Property(p => p.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(p => p.CreateBy)
                   .HasColumnName("create_by")
                   .HasMaxLength(50);

            builder.Property(p => p.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(p => p.UpdateBy)
                   .HasColumnName("update_by")
                   .HasMaxLength(50);
            builder.Property(pt => pt.ProjectTypeId)
                    .HasColumnName("project_type_id");

            builder.Property(c => c.IsActive)
                .HasColumnName("is_active");

            builder.Property(c => c.ProjectCode)
                .HasColumnName("project_code");

            builder.Property(c => c.InchargeName)
                .HasColumnName("incharge_name");

            builder.Property(c => c.Auditor)
                .HasColumnName("auditor");

            builder.Property(c => c.Approver)
                .HasColumnName("approver");

            builder.Property(c => c.IvNo)
                .HasColumnName("iv_no");

            builder.Property(c => c.IvDate)
                .HasColumnName("iv_date");

            builder.Property(c => c.PoNo)
              .HasColumnName("po_no");

            builder.Property(c => c.TimesheetDateStart)
               .HasColumnName("timesheet_date_start");
        }
    }
}

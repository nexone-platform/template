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
    public class OvertimeRequestConfiguration
   : IEntityTypeConfiguration<OvertimeRequest>
    {
        public void Configure(EntityTypeBuilder<OvertimeRequest> entity)
        {
            entity.HasKey(e => e.OvertimeId)
                  .HasName("pk_overtime_id");

            entity.Property(e => e.OvertimeId)
                  .HasColumnName("overtime_id")
                  .IsRequired()
                  .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-overtime-id'::regclass)");

            entity.Property(e => e.CreateDate)
                  .HasColumnName("create_date")
                  .HasColumnType("timestamp");

            entity.Property(e => e.CreateBy)
                  .HasColumnName("create_by")
                  .HasMaxLength(50);

            entity.Property(e => e.UpdateDate)
                  .HasColumnName("update_date")
                  .HasColumnType("timestamp");

            entity.Property(e => e.UpdateBy)
                  .HasColumnName("update_by")
                  .HasMaxLength(50);

            entity.Property(e => e.EmployeeId)
                  .HasColumnName("employee_id")
                  .IsRequired();

            entity.Property(e => e.OvertimeDate)
                  .HasColumnName("overtime_date")
                  .HasDefaultValueSql("CURRENT_DATE");

            entity.Property(e => e.Type)
                  .HasColumnName("type");

            entity.Property(e => e.Description)
                  .HasColumnName("description");

            entity.Property(e => e.IsApproved)
                  .HasColumnName("is_approved")
                  .HasDefaultValue(false);

            entity.Property(e => e.ApprovedId)
                  .HasColumnName("approved_id");

            entity.Property(e => e.ApprovalDate)
                  .HasColumnName("approval_date")
                  .HasColumnType("timestamp");

            entity.Property(e => e.Comments)
                  .HasColumnName("comments");

            entity.Property(e => e.Status)
                  .HasColumnName("status");

            entity.Property(e => e.Hour)
                 .HasColumnName("hour");
            entity.Property(e => e.Amount)
               .HasColumnName("amount");

            entity.Property(e => e.IsFromTimesheet)
              .HasColumnName("is_from_timesheet");

            entity.Property(e => e.ProjectId)
             .HasColumnName("project_id");

            entity.Property(e => e.RequestorId)
                 .HasColumnName("requestor_id");

            entity.Property(e => e.OrganizationCode)
             .HasColumnName("organization_code");

            entity.Property(t => t.RefId).HasColumnName("ref_id");
            entity.Property(e => e.CurrentApprovalLevel).HasColumnName("current_approval_level");
        }

    }
}

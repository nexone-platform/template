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
    public class LeaveQuotaConfiguration : IEntityTypeConfiguration<LeaveQuota>
    {
        public void Configure(EntityTypeBuilder<LeaveQuota> builder)
        {
            // Primary key
            builder.HasKey(e => e.QuotaId);

            builder.Property(e => e.QuotaId)
                  .HasColumnName("id")
                  .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-leave-quota-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.Year).HasColumnName("year");
            builder.Property(e => e.Quota).HasColumnName("quota");
            builder.Property(e => e.EmployeeId).HasColumnName("employee_id");
            builder.Property(e => e.LeaveTypeId).HasColumnName("leave_type_id");
            builder.Property(e => e.CarryForward).HasColumnName("carry_forward");
            builder.Property(e => e.ExtraDay).HasColumnName("extra_day");

        }
    }
}

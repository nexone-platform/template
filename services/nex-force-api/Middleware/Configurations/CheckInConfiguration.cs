using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;
using Middlewares.Models;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Middleware.Configurations
{
    public class CheckInConfiguration : IEntityTypeConfiguration<CheckIn>
    {
        public void Configure(EntityTypeBuilder<CheckIn> builder)
        {
            builder.HasKey(e => e.CheckInId);

            builder.Property(e => e.CheckInId)
                   .HasColumnName("check_in_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-check-in-id'::regclass)");

            builder.Property(e => e.CheckOutTime)
                   .HasColumnName("check_out_time");

            builder.Property(e => e.CheckInTime)
                   .HasColumnName("check_in_time");

            builder.Property(e => e.BreakStartTime)
                   .HasColumnName("break_start_time");

            builder.Property(e => e.BreakEndTime)
                   .HasColumnName("break_end_time");

            builder.Property(e => e.EmployeeId)
                   .HasColumnName("employee_id");

            builder.Property(e => e.CheckInLat)
                  .HasColumnName("check_in_lat");

            builder.Property(e => e.CheckInLong)
                   .HasColumnName("check_in_long");
            builder.Property(e => e.CheckOutLat)
                    .HasColumnName("check_out_lat");

            builder.Property(e => e.CheckOutLong)
                   .HasColumnName("check_out_long");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
        }
    }
}


using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class LeaveTypeConfiguration : IEntityTypeConfiguration<LeaveType>
    {
        public void Configure(EntityTypeBuilder<LeaveType> builder)
        {

            // Primary key
            builder.HasKey(e => e.LeaveTypeId);

            builder.Property(e => e.LeaveTypeId)
                  .HasColumnName("leave_type_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-leave-type-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.LeaveTypeNameTh).HasColumnName("leave_type_name_th");
            builder.Property(e => e.LeaveTypeNameEn).HasColumnName("leave_type_name_en");
            builder.Property(e => e.IsActive).HasColumnName("isactive");
            builder.Property(e => e.LeaveTypeCode).HasColumnName("leave_type_code");
        }
    }
}

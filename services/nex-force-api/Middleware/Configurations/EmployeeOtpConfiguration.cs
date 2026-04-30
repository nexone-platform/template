using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class EmployeeOtpConfiguration : IEntityTypeConfiguration<EmployeeOtp>
    {
        public void Configure(EntityTypeBuilder<EmployeeOtp> builder)
        {

            builder.ToTable("emp-tb-tr-otp", "public");

            // Primary key
            builder.HasKey(e => e.OtpId);

            builder.Property(e => e.OtpId)
                  .HasColumnName("otp_id")
                  .HasDefaultValueSql("nextval('\"public\".emp-sq-otp'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.Otp).HasColumnName("otp");
            builder.Property(e => e.EmployeeId).HasColumnName("employee_id");
            builder.Property(e => e.Email).HasColumnName("email");
            builder.Property(e => e.Expiry).HasColumnName("expiry");
        }
    }
}

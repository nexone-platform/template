using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class DesignationConfiguration : IEntityTypeConfiguration<Designation>
    {
        public void Configure(EntityTypeBuilder<Designation> builder)
        {

            // Primary key
            builder.HasKey(e => e.DesignationId);

            builder.Property(e => e.DesignationId)
                  .HasColumnName("designation_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-designation-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.DesignationNameTh).HasColumnName("designation_name_en");
            builder.Property(e => e.DesignationNameEn).HasColumnName("designation_name_th");
            builder.Property(e => e.DepartmentId).HasColumnName("department_id");
            builder.Property(e => e.DesignationCode).HasColumnName("designation_code");
            builder.Property(e => e.IsActive).HasColumnName("isactive");

        }
    }
}

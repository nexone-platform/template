using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
    {
        public void Configure(EntityTypeBuilder<Department> builder)
        {

            // Primary key
            builder.HasKey(e => e.DepartmentId);

            builder.Property(e => e.DepartmentId)
                  .HasColumnName("deparment_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-deparment-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.DepartmentNameTh).HasColumnName("department_name_th");
            builder.Property(e => e.DepartmentNameEn).HasColumnName("department_name_en");
            builder.Property(e => e.IsActive).HasColumnName("isactive");
            builder.Property(e => e.DepartmentCode).HasColumnName("department_code");
        }
    }
}

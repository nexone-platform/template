using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {

            // Primary key
            builder.HasKey(e => e.RoleId);
            builder.Property(u => u.RoleId)
                    .HasColumnName("role_id").HasDefaultValueSql("nextval('\"solution-one\".hr-sq-role-id'::regclass)");

            builder.Property(u => u.RoleName)
                    .HasColumnName("role_name");
            // Column mappings
            builder.Property(u => u.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(u => u.CreateBy)
                   .HasColumnName("create_by");

            builder.Property(u => u.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(u => u.UpdateBy)
                   .HasColumnName("update_by");

            builder.Property(e => e.DepartmentId)
                    .HasColumnName("deparment_id");
        }
    }
}

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
    public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
    {
        public void Configure(EntityTypeBuilder<RolePermission> builder)
        {
            builder.HasKey(p => p.PermissionId);
            builder.Property(p => p.PermissionId)
                   .HasColumnName("permission_id")
                   .HasDefaultValueSql("nextval('nex_core.role_permissions_permission_id_seq'::regclass)") // Use sequence for auto-incrementing ID
                   .IsRequired();

            builder.Property(e => e.IsActive)
                .HasColumnName("is_active");


            builder.Property(e => e.RoleId)
                .HasColumnName("role_id");

            builder.Property(e => e.MenuId)
                .HasColumnName("menu_id");

            builder.Property(e => e.AppName)
                .HasColumnName("app_name");

            builder.Property(e => e.CanView)
                .HasColumnName("can_view");

            builder.Property(e => e.CanEdit)
                .HasColumnName("can_edit");

            builder.Property(e => e.CanAdd)
                .HasColumnName("can_add");

            builder.Property(e => e.CanDelete)
                .HasColumnName("can_delete");

            builder.Property(e => e.CanImport)
                .HasColumnName("can_import");

            builder.Property(e => e.CanExport)
                .HasColumnName("can_export");

            builder.Property(e => e.CreateDate)
                .HasColumnName("create_date");

            builder.Property(e => e.CreateBy)
                .HasColumnName("create_by");

            builder.Property(e => e.UpdateDate)
                .HasColumnName("update_date");

            builder.Property(e => e.UpdateBy)
                .HasColumnName("update_by");

            // Optional: Define foreign key relationships
            builder.HasOne(e => e.Role)
                .WithMany()  // Assuming one-to-many relationship
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.Menu)
                .WithMany()  // Assuming one-to-many relationship
                .HasForeignKey(e => e.MenuId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint on RoleId and MenuId
            builder.HasIndex(e => new { e.RoleId, e.MenuId })
                .IsUnique();
        }
    }
}

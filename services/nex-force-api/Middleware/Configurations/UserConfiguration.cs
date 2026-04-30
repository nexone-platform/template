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
    public class AuthTbMsUserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {

            builder.ToTable("auth-tb-ms-user", "public");

            builder.Property(e => e.UserId)
                .HasColumnName("user_id")
                .HasDefaultValueSql("nextval('\"public\".auth-sq-user-id'::regclass)")
                .IsRequired();
            // Primary Key
            builder.HasKey(u => u.UserId)
                   .HasName("pk_tb_user"); // Optionally specify a primary key constraint

            // Column mappings
            builder.Property(u => u.CreateDate)
                   .HasColumnName("create_date")
                   .IsRequired(false); // Nullable property

            builder.Property(u => u.CreateBy)
                   .HasColumnName("create_by")
                   .IsRequired(false); // Nullable property

            builder.Property(u => u.UpdateDate)
                   .HasColumnName("update_date")
                   .IsRequired(false); // Nullable property

            builder.Property(u => u.UpdateBy)
                   .HasColumnName("update_by")
                   .IsRequired(false); // Nullable property

            builder.Property(u => u.UserId)
                   .HasColumnName("user_id")
                   .HasColumnType("numeric") // Match the database type
                   .IsRequired(); // Non-nullable property

            builder.Property(u => u.EmployeeId)
                   .HasColumnName("employee_id")
                   .IsRequired(false); // Nullable property

            builder.Property(u => u.Email)
                   .HasColumnName("email")
                   .IsRequired(false); // Nullable property

            builder.Property(u => u.Password)
                   .HasColumnName("password")
                   .IsRequired(false); // Nullable property
            builder.Property(u => u.Salt)
                  .HasColumnName("salt")
                  .IsRequired(false); // Nullable property

            builder.Property(u => u.RoleId)
                   .HasColumnName("role_id");

            builder.Property(u => u.BackUpPassword)
                 .HasColumnName("backup_password");

            builder.Property(u => u.IsActive)
               .HasColumnName("is_active");
            builder.Property(u => u.LineToken)
              .HasColumnName("line_token");
            builder.Property(u => u.LineUserId)
               .HasColumnName("line_user_id");
        }
    }
}

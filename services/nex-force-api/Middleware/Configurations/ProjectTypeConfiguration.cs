using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;
using Middlewares.Models;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Middleware.Configurations
{
    public class ProjectTypeConfiguration : IEntityTypeConfiguration<ProjectType>
    {
        public void Configure(EntityTypeBuilder<ProjectType> builder)
        {

            builder.HasKey(pt => pt.ProjectTypeId); // Primary key

            // Configure properties
            builder.Property(pt => pt.ProjectTypeId)
                   .HasColumnName("project_type_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-project-type'::regclass)");

            builder.Property(pt => pt.CreateDate)
                   .HasColumnName("create_date")
                   .IsRequired(false); // Allow null

            builder.Property(pt => pt.CreateBy)
                   .HasColumnName("create_by")
                   .HasMaxLength(50)
                   .IsRequired(false); // Allow null

            builder.Property(pt => pt.UpdateDate)
                   .HasColumnName("update_date")
                   .IsRequired(false); // Allow null

            builder.Property(pt => pt.UpdateBy)
                   .HasColumnName("update_by")
                   .HasMaxLength(50)
                   .IsRequired(false); // Allow null

            builder.Property(pt => pt.ProjectTypeNameTh)
                   .HasColumnName("project_type_name_th")
                   .HasMaxLength(255)
                   .IsRequired(); // Required

            builder.Property(pt => pt.ProjectTypeNameEn)
                   .HasColumnName("project_type_name_en")
                   .HasMaxLength(255)
                   .IsRequired(); // Required

            builder.Property(pt => pt.ProjectTypeCode)
                   .HasColumnName("project_type_code")
                   .HasMaxLength(255)
                   .IsRequired(false); // Allow null

            builder.Property(c => c.IsActive)
                .HasColumnName("is_active");
        }
    }
    
}


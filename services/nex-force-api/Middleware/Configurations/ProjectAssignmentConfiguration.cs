using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Middlewares.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Configurations
{
    public class ProjectAssignmentConfiguration : IEntityTypeConfiguration<ProjectAssignment>
    {
        public void Configure(EntityTypeBuilder<ProjectAssignment> builder)
        {
            builder.HasKey(x => x.AssignmentId);

            builder.Property(x => x.AssignmentId)
                .HasColumnName("assignment_id");

            builder.Property(x => x.ProjectId).HasColumnName("project_id");
            builder.Property(x => x.EmployeeId).HasColumnName("employee_id");

            builder.Property(x => x.RoleType).HasColumnName("role_type")
                .HasMaxLength(20)
                .HasDefaultValue("MEMBER");
            builder.Property(x => x.AssignedDate).HasColumnName("assigned_date");

            builder.Property(t => t.IsActive)
                .IsRequired()
                .HasDefaultValue(true)
                .HasColumnName("is_active");

            builder.Property(t => t.CreateDate)
                .HasColumnName("create_date");

            builder.Property(t => t.CreateBy)
                .HasMaxLength(50)
                .HasColumnName("create_by");

            builder.Property(t => t.UpdateDate)
                .HasColumnName("update_date");

            builder.Property(t => t.UpdateBy)
                .HasMaxLength(50)
                .HasColumnName("update_by");
            builder.HasIndex(x => new { x.ProjectId, x.EmployeeId })
                .IsUnique(); 
        }
    }
}

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
    public class PromotionConfiguration : IEntityTypeConfiguration<Promotion>
    {
        public void Configure(EntityTypeBuilder<Promotion> builder)
        {
            builder.HasKey(p => p.PromotionId);

            builder.Property(p => p.PromotionId)
                .HasColumnName("promotion_id").HasDefaultValueSql("nextval('\"solution-one\".pm-sq-promotion-id'::regclass)") // Use sequence for auto-incrementing ID
                   .IsRequired();


            builder.Property(p => p.EmployeeId)
                .HasColumnName("employee_id");

            builder.Property(p => p.DesignationFromId)
                .HasColumnName("designation_from_id");

            builder.Property(p => p.DepartmentFromId)
                .HasColumnName("department_from_id");

            builder.Property(p => p.DesignationToId)
                .HasColumnName("designation_to_id");

            builder.Property(p => p.DepartmentToId)
                .HasColumnName("department_to_id");

            builder.Property(p => p.PromotionDate)
                .HasColumnName("promotion_date");

            builder.Property(p => p.OldSalary)
                .HasColumnName("old_salary");


            builder.Property(p => p.NewSalary)
                .HasColumnName("new_salary");

            builder.Property(p => p.ApproverId)
                .HasColumnName("approver_id")
                .IsRequired();

            builder.Property(p => p.Status)
                .HasColumnName("status");

            builder.Property(p => p.CreateDate)
                .HasColumnName("create_date");

            builder.Property(p => p.CreateBy)
                .HasColumnName("create_by");

            builder.Property(p => p.UpdateDate)
                .HasColumnName("update_date");

            builder.Property(p => p.UpdateBy)
                .HasColumnName("update_by");
            builder.Property(r => r.ApprovalDate).HasColumnName("approval_date");
            builder.Property(r => r.Comments).HasColumnName("comments");

            builder.Property(t => t.RefId).HasColumnName("ref_id");
            builder.Property(e => e.CurrentApprovalLevel).HasColumnName("current_approval_level");
        }
    }
}

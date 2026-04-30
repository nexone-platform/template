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
    public class ApprovalStepConfiguration : IEntityTypeConfiguration<ApprovalStep>
    {
        public void Configure(EntityTypeBuilder<ApprovalStep> builder)
        {
            builder.HasKey(x => x.StepId);
            builder.Property(e => e.StepId).HasColumnName("step_id").HasDefaultValueSql("nextval('\"solution-one\".\"app-tb-ms-approval-step-id\"'::regclass)"); 
            builder.Property(e => e.RuleId).HasColumnName("rule_id");
            builder.Property(e => e.StepOrder).HasColumnName("step_order");
            builder.Property(e => e.Position).HasColumnName("position");
            builder.Property(e => e.MinAmount).HasColumnName("min_amount");
            builder.Property(e => e.MaxAmount).HasColumnName("max_amount");
            builder.Property(e => e.Department).HasColumnName("department");
            builder.Property(e => e.IsParallel).HasColumnName("is_parallel");
            builder.Property(e => e.ThresholdCount).HasColumnName("threshold_count");
            builder.Property(e => e.ApproverId).HasColumnName("approver_id");

            // Audit fields
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");

            builder.Property(e => e.RefId).HasColumnName("ref_id");
            builder.Property(u => u.RoleId).HasColumnName("role_id");
            builder.Property(u => u.DesignationId).HasColumnName("designation_id");
            //builder.Property(e => e.IsActive).HasColumnName("is_active");
        }
    }

}

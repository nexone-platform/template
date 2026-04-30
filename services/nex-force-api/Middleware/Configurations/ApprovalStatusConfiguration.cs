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
    public class ApprovalStatusConfiguration : IEntityTypeConfiguration<ApprovalStatus>
    {
        public void Configure(EntityTypeBuilder<ApprovalStatus> builder)
        {
            builder.HasKey(x => x.InstanceId);

            builder.Property(e => e.InstanceId).HasColumnName("instance_id").HasDefaultValueSql("nextval('\"solution-one\".\"app-tb-ms-approval-status-id\"'::regclass)") ;
            builder.Property(e => e.RefType).HasColumnName("ref_type");
            builder.Property(e => e.RefId).HasColumnName("ref_id");
            builder.Property(e => e.RuleId).HasColumnName("rule_id");
            builder.Property(e => e.Status).HasColumnName("status");
            builder.Property(e => e.RequestedBy).HasColumnName("requested_by");
            builder.Property(e => e.RequestedAt).HasColumnName("requested_at");

            // Audit fields
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");

            builder.Property(e => e.RefRequestId).HasColumnName("ref_request_id");

            builder.Property(e => e.CurrentStepOrder).HasColumnName("current_step_order");
        }
    }
}

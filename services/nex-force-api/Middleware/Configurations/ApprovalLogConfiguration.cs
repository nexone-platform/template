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
    public class ApprovalLogConfiguration : IEntityTypeConfiguration<ApprovalLog>
    {
        public void Configure(EntityTypeBuilder<ApprovalLog> builder)
        {
            {

                builder.HasKey(e => e.ActionId); 

                builder.Property(e => e.ActionId)
                       .HasColumnName("action_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".\"app-tb-ms-approval-log-id\"'::regclass)");

                builder.Property(e => e.InstanceId).HasColumnName("instance_id");
                builder.Property(e => e.StepId).HasColumnName("step_id");
                builder.Property(e => e.ApproverId).HasColumnName("approver_id");
                builder.Property(e => e.Action).HasColumnName("action").HasMaxLength(200);
                builder.Property(e => e.ActionDate).HasColumnName("action_date");
                builder.Property(e => e.ReasonId).HasColumnName("reason_id");
                builder.Property(e => e.Comment).HasColumnName("comment").HasMaxLength(200);

                builder.Property(e => e.CreateDate).HasColumnName("create_date");
                builder.Property(e => e.CreateBy).HasColumnName("create_by").HasMaxLength(50);
                builder.Property(e => e.UpdateDate).HasColumnName("update_date");
                builder.Property(e => e.UpdateBy).HasColumnName("update_by").HasMaxLength(50);
            }
        }
    }
}

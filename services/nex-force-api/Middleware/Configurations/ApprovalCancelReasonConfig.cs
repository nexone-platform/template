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
    public class ApprovalCancelReasonConfig : IEntityTypeConfiguration<ApprovalCancelReason>
    {
        public void Configure(EntityTypeBuilder<ApprovalCancelReason> builder)
        {
            builder.HasKey(x => x.ReasonId);

            builder.Property(x => x.ReasonId)
                   .HasColumnName("reason_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".\"app-tb-ms-approval-cancel-reason-id\"')");

            builder.Property(x => x.ReasonDetail).HasColumnName("reason_detail").HasMaxLength(255).IsRequired();
            builder.Property(x => x.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("NOW()");

            builder.Property(x => x.CreateDate).HasColumnName("create_date");
            builder.Property(x => x.CreateBy).HasColumnName("create_by").HasMaxLength(50);
            builder.Property(x => x.UpdateDate).HasColumnName("update_date");
            builder.Property(x => x.UpdateBy).HasColumnName("update_by").HasMaxLength(50);
        }
    }
}

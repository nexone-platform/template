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
    public class ResignationConfiguration : IEntityTypeConfiguration<Resignation>
    {
        public void Configure(EntityTypeBuilder<Resignation> builder)
        {

            builder.HasKey(r => r.ResignationId);
            builder.Property(r => r.ResignationId).HasColumnName("resignation_id").HasDefaultValueSql("nextval('\"solution-one\".pm-sq-resignation-id'::regclass)");

            builder.Property(r => r.EmployeeId)
                .HasColumnName("employee_id");

            builder.Property(r => r.NoticeDate).HasColumnName("notice_date");
            builder.Property(r => r.ResignationDate).HasColumnName("resignation_date");
            builder.Property(r => r.RequestDate).HasColumnName("request_date").HasDefaultValueSql("CURRENT_DATE");

            builder.Property(r => r.Reason).HasColumnName("reason");
            builder.Property(r => r.IsApproved).HasColumnName("is_approved");
            builder.Property(r => r.ApprovedId).HasColumnName("approved_id");
            builder.Property(r => r.ApprovalDate).HasColumnName("approval_date");
            builder.Property(r => r.Comments).HasColumnName("comments");
            builder.Property(r => r.Status).HasColumnName("status");

            builder.Property(r => r.CreateDate).HasColumnName("create_date");
            builder.Property(r => r.CreateBy).HasColumnName("create_by");
            builder.Property(r => r.UpdateDate).HasColumnName("update_date");
            builder.Property(r => r.UpdateBy).HasColumnName("update_by");
            builder.Property(t => t.RefId).HasColumnName("ref_id");
            builder.Property(e => e.CurrentApprovalLevel).HasColumnName("current_approval_level");
        }
    }
}

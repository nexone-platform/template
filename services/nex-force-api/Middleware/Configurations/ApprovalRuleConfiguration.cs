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
    public class ApprovalRuleConfiguration : IEntityTypeConfiguration<ApprovalRule>
    {
        public void Configure(EntityTypeBuilder<ApprovalRule> builder)
        {
            builder.HasKey(x => x.RuleId);
            builder.Property(e => e.RuleId).HasColumnName("rule_id").HasDefaultValueSql("nextval('\"solution-one\".\"app-tb-ms-approval-rule-id\"'::regclass)");
            builder.Property(e => e.RuleName).HasColumnName("rule_name");
            builder.Property(e => e.RuleTypeId).HasColumnName("rule_type_id");
            builder.Property(e => e.IsActive).HasColumnName("is_active");
            builder.Property(e => e.StartDate).HasColumnName("start_date");
            builder.Property(e => e.EndDate).HasColumnName("end_date");

            // Audit fields
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
        }
    }
}

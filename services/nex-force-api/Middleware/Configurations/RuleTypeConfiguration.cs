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
    public class RuleTypeConfiguration : IEntityTypeConfiguration<RuleType>
    {
        public void Configure(EntityTypeBuilder<RuleType> builder)
        {
            builder.HasKey(x => x.RuleTypeId);
            builder.Property(e => e.RuleTypeId).HasColumnName("rule_type_id").HasDefaultValueSql("nextval('\"solution-one\".\"app-tb-ms-rule-type-id\"'::regclass)");
            builder.Property(e => e.Rule).HasColumnName("rule").HasMaxLength(200);
            builder.Property(e => e.Description).HasColumnName("description").HasMaxLength(200);

            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by").HasMaxLength(50);
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by").HasMaxLength(50);
        }
    }

}

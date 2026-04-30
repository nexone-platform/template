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
    public class ApprovalReferenceConfig : IEntityTypeConfiguration<ApprovalReference>
    {
        public void Configure(EntityTypeBuilder<ApprovalReference> builder)
        {
            builder.HasKey(x => x.RefId);

            builder.Property(x => x.RefId)
                   .HasColumnName("ref_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".\"app-tb-ms-approval-reference-id\"')");

            builder.Property(x => x.RefType).HasColumnName("ref_type");
            builder.Property(x => x.Description).HasColumnName("description");

            builder.Property(x => x.CreateDate).HasColumnName("create_date");
            builder.Property(x => x.CreateBy).HasColumnName("create_by");
            builder.Property(x => x.UpdateDate).HasColumnName("update_date");
            builder.Property(x => x.UpdateBy).HasColumnName("update_by");
        }
    }
}

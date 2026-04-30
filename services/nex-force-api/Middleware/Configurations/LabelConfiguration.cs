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
    public class LabelConfiguration : IEntityTypeConfiguration<Label>
    {
        public void Configure(EntityTypeBuilder<Label> builder)
        {
            builder.HasKey(e => new { e.LabelsId, e.LabelKey });

            builder.Property(e => e.LabelsId)
                .HasColumnName("labels_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".amd-sq-labels-id'::regclass)");

            builder.Property(e => e.LabelKey).HasColumnName("label_key").HasMaxLength(50);
            builder.Property(e => e.Description).HasColumnName("description").HasMaxLength(100);
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by").HasMaxLength(50);
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by").HasMaxLength(50);
        }
    }
}

using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class PreFixesConfiguration : IEntityTypeConfiguration<Prefixes>
    {
        public void Configure(EntityTypeBuilder<Prefixes> builder)
        {

            // Primary key
            builder.HasKey(e => e.PrefixId);

            builder.Property(e => e.PrefixId)
                  .HasColumnName("prefix_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".adm-sq-prefix_id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.PrefixKey).HasColumnName("prefix_key");
            builder.Property(e => e.PrefixLabel).HasColumnName("prefix_label");
            builder.Property(e => e.PrefixValue).HasColumnName("prefix_value");
            builder.Property(e => e.SeqShow).HasColumnName("seq_show");
        }
    }
}

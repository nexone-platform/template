using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class NotificationChanelConfiguration : IEntityTypeConfiguration<NotificationChanel>
    {
        public void Configure(EntityTypeBuilder<NotificationChanel> builder)
        {
            // Primary key
            builder.HasKey(e => e.ChanelId);

            builder.Property(e => e.ChanelId)
                  .HasColumnName("chanel_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".adm-sq-chanel-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.ChanelKey).HasColumnName("chanel_key");
            builder.Property(e => e.Description).HasColumnName("description");
            builder.Property(e => e.SeqShow).HasColumnName("seq_show");
        }
    }
}

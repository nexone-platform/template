using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class NotificationModuleConfiguration : IEntityTypeConfiguration<NotificationModule>
    {
        public void Configure(EntityTypeBuilder<NotificationModule> builder)
        {
            // Primary key
            builder.HasKey(e => e.ModuleId);

            builder.Property(e => e.ModuleId)
                  .HasColumnName("module_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".adm-sq-module-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.Module).HasColumnName("module");
            builder.Property(e => e.Description).HasColumnName("description");
            builder.Property(e => e.SeqShow).HasColumnName("seq_show");
        }
    }
}

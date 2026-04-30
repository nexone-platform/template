using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class NotificationSettingConfiguration : IEntityTypeConfiguration<NotificationSetting>
    {
        public void Configure(EntityTypeBuilder<NotificationSetting> builder)
        {
            // Primary key
            builder.HasKey(e => e.NotiId);

            builder.Property(e => e.NotiId)
                  .HasColumnName("noti_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".adm-sq-noti-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.ProgramId).HasColumnName("program_id");
            builder.Property(e => e.ModuleId).HasColumnName("module_id");
            builder.Property(e => e.ChanelId).HasColumnName("chanel_id");

        }
    }
}

using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class ScheduleTimingConfiguration : IEntityTypeConfiguration<ScheduleTiming>
    {
        public void Configure(EntityTypeBuilder<ScheduleTiming> builder)
        {

            // Primary key
            builder.HasKey(e => e.ScheduleId);

            builder.Property(e => e.ScheduleId)
                  .HasColumnName("schedule_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".adm-sq-schedule-timing-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.ManageResumeId).HasColumnName("manage_resume_id");
            builder.Property(e => e.JobTitleId).HasColumnName("job_title_id");
            builder.Property(e => e.StartDate).HasColumnName("start_date");
            builder.Property(e => e.ExpiredDate).HasColumnName("expired_date");
            builder.Property(e => e.Status).HasColumnName("status");
       
        }
    }
}

using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class InterviewResultConfiguration : IEntityTypeConfiguration<InterviewResult>
    {
        public void Configure(EntityTypeBuilder<InterviewResult> builder)
        {

            // Primary key
            builder.HasKey(e => e.InterviewResultId);

            builder.Property(e => e.InterviewResultId)
                  .HasColumnName("interview_result_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".adm-sq-interview-result-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.ManageResumeId).HasColumnName("manage_resume_id");
            builder.Property(e => e.ScheduleId).HasColumnName("schedule_id");
            builder.Property(e => e.DepartmentId).HasColumnName("department_id");
            builder.Property(e => e.DateInternal).HasColumnName("date_internal");
            builder.Property(e => e.DateExternal).HasColumnName("date_external");
            builder.Property(e => e.StatusInternal).HasColumnName("status_internal");
            builder.Property(e => e.StatusExternal).HasColumnName("status_external");
            builder.Property(e => e.Comment).HasColumnName("comment");
            builder.Property(e => e.Step).HasColumnName("step");

        }
    }
}

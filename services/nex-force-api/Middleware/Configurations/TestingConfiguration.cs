using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class TestingConfiguration : IEntityTypeConfiguration<Testing>
    {
        public void Configure(EntityTypeBuilder<Testing> builder)
        {

            // Primary key
            builder.HasKey(e => e.TestingId);

            builder.Property(e => e.TestingId)
                  .HasColumnName("testing_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".adm-sq-testing-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.ManageResumeId).HasColumnName("manage_resume_id");
            builder.Property(e => e.CategoryId).HasColumnName("category_id");
            builder.Property(e => e.AnswersJson).HasColumnName("answers_json");
            builder.Property(e => e.Score).HasColumnName("score");
            builder.Property(e => e.Time).HasColumnName("time");
            builder.Property(e => e.SpentSeconds).HasColumnName("spent_seconds");
            builder.Property(e => e.Status).HasColumnName("status");
       
        }
    }
}

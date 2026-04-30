using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class QuestionsConfiguration : IEntityTypeConfiguration<Questions>
    {
        public void Configure(EntityTypeBuilder<Questions> builder)
        {

            // Primary key
            builder.HasKey(e => e.QuestionsId);

            builder.Property(e => e.QuestionsId)
                  .HasColumnName("questions_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".adm-sq-questions-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.CategoryId).HasColumnName("category_id");
            builder.Property(e => e.Position).HasColumnName("position");
            builder.Property(e => e.Question).HasColumnName("questions");
            builder.Property(e => e.OptionA).HasColumnName("option_a");
            builder.Property(e => e.OptionB).HasColumnName("option_b");
            builder.Property(e => e.OptionC).HasColumnName("option_c");
            builder.Property(e => e.OptionD).HasColumnName("option_d");
            builder.Property(e => e.CorrectAns).HasColumnName("correct_ans");
            builder.Property(e => e.CodeSnippets).HasColumnName("code_snippets");
            builder.Property(e => e.AnsExplanation).HasColumnName("ans_explanation");
            builder.Property(e => e.VideoIink).HasColumnName("video_link");
            builder.Property(e => e.ImgPath).HasColumnName("img_path");

        }
    }
}

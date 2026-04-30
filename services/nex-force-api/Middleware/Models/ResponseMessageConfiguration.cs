using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Middlewares.Models
{
    public class ResponseMessageConfiguration : IEntityTypeConfiguration<ResponseMessage>
    {
        public void Configure(EntityTypeBuilder<ResponseMessage> builder)
        {
            builder.ToTable("adm-tb-ms-response-messages", "solution-one");

            builder.HasKey(e => e.MessageId);

            builder.Property(e => e.MessageId)
                .HasColumnName("message_id")
                .ValueGeneratedOnAdd()
                .HasDefaultValueSql("nextval('\"solution-one\".\"adm-sq-response-message-id\"'::regclass)");

            builder.Property(e => e.LanguageCode).HasColumnName("language_code").HasMaxLength(10);
            builder.Property(e => e.MessageKey).HasColumnName("message_key").HasMaxLength(100);
            builder.Property(e => e.Category).HasColumnName("category").HasMaxLength(20);
            builder.Property(e => e.Title).HasColumnName("title").HasMaxLength(200);
            builder.Property(e => e.Message).HasColumnName("message").HasMaxLength(500);
            builder.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by").HasMaxLength(50);
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by").HasMaxLength(50);

            // Unique constraint: one message per language per key
            builder.HasIndex(e => new { e.LanguageCode, e.MessageKey }).IsUnique();
        }
    }
}

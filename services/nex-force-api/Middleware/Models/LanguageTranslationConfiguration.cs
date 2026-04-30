using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{
    public class LanguageTranslationConfiguration : IEntityTypeConfiguration<LanguageTranslation>
    {
        public void Configure(EntityTypeBuilder<LanguageTranslation> builder)
        {
            builder.ToTable("adm-tb-ms-language-translations", "solution-one");

            builder.HasKey(e => new { e.TranslationsId, e.LanguageCode, e.PageKey, e.LabelKey });

            builder.Property(e => e.TranslationsId)
                .HasColumnName("translations_id")
                .HasDefaultValueSql("nextval('\"solution-one\".\"amd-sq-translations-id\"'::regclass)");

            builder.Property(e => e.LanguageCode).HasColumnName("language_code").HasMaxLength(2);
            builder.Property(e => e.PageKey).HasColumnName("page_key").HasMaxLength(50);
            builder.Property(e => e.LabelKey).HasColumnName("label_key").HasMaxLength(100);
            builder.Property(e => e.LabelValue).HasColumnName("label_value").HasMaxLength(200);
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by").HasMaxLength(50);
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by").HasMaxLength(50);
        }
    }
}

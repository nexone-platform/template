using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Models
{

    public class LanguageConfiguration : IEntityTypeConfiguration<Language>
    {
        public void Configure(EntityTypeBuilder<Language> builder)
        {
            builder.HasKey(e => new { e.LanguagesId, e.LanguageCode });

            builder.HasIndex(e => e.LanguageName).IsUnique();

            builder.Property(e => e.LanguagesId)
               .HasColumnName("languages_id")
               .HasDefaultValueSql("nextval('\"solution-one\".\"amd-sq-languages-id\"'::regclass)");

            builder.Property(e => e.LanguageCode).HasColumnName("language_code").HasMaxLength(2);
            builder.Property(e => e.LanguageName).HasColumnName("language_name").HasMaxLength(50);
            builder.Property(e => e.Description).HasColumnName("description").HasMaxLength(100);
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by").HasMaxLength(50);
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by").HasMaxLength(50);
        }
    }
}

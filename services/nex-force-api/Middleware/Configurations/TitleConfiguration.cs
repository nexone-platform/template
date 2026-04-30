using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class TitleConfiguration : IEntityTypeConfiguration<Title>
    {
        public void Configure(EntityTypeBuilder<Title> builder)
        {

            // Primary key
            builder.HasKey(e => e.TitleID);

            builder.Property(e => e.TitleID)
                  .HasColumnName("title_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".adm-sq-title-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.TitleNameTh).HasColumnName("title_name_th");
            builder.Property(e => e.TitleNameEn).HasColumnName("title_name_en");
            builder.Property(e => e.TitleNameCode).HasColumnName("title_name_code");
        }
    }
}

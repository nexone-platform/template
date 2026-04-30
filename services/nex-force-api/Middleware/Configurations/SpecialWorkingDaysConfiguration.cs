using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class SpecialWorkingDaysConfiguration : IEntityTypeConfiguration<SpecialWorkingDays>
    {
        public void Configure(EntityTypeBuilder<SpecialWorkingDays> builder)
        {

            // Primary key
            builder.HasKey(e => e.SpecialDaysId);

            builder.Property(e => e.SpecialDaysId)
                  .HasColumnName("id")
                  .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-special-days-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.TitleTh).HasColumnName("title_th");
            builder.Property(e => e.TitleEn).HasColumnName("title_en");
            builder.Property(e => e.Day).HasColumnName("day");
            builder.Property(e => e.SpecialDate).HasColumnName("special_date");
            builder.Property(e => e.IsActive).HasColumnName("isactive");
            builder.Property(e => e.IsAnnual).HasColumnName("isannaul"); 
            builder.Property(e => e.OrganizationCode).HasColumnName("organization_code");
        }
    }
}

using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;
using Middlewares.Models;

namespace Middleware.Configurations
{
    public class AssetCategoryConfiguration : IEntityTypeConfiguration<AssetCategory>
    {
        public void Configure(EntityTypeBuilder<AssetCategory> builder)
        {
            builder.HasKey(e => e.CategoryId);

            builder.Property(e => e.CategoryId)
                   .HasColumnName("asset_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-category-id'::regclass)"); // Adjust sequence name if needed

            builder.Property(e => e.CategoryName)
                   .HasColumnName("category_name")
                   .IsRequired();

            builder.Property(e => e.Img)
                   .HasColumnName("img");

            builder.Property(e => e.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(e => e.CreateBy)
                   .HasColumnName("create_by");

            builder.Property(e => e.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(e => e.UpdateBy)
                   .HasColumnName("update_by");
        }
    }
}

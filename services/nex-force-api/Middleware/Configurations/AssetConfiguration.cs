using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;
using Middlewares.Models;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace Middleware.Configurations
{
    public class AssetConfiguration : IEntityTypeConfiguration<Asset>
    {
        public void Configure(EntityTypeBuilder<Asset> builder)
        {
            builder.HasKey(e => e.AssetId);

            builder.Property(e => e.AssetId)
                   .HasColumnName("asset_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-asset-id'::regclass)"); // Adjust sequence name if needed

            builder.Property(e => e.AssetName)
                   .HasColumnName("asset_name")
                   .IsRequired();

            builder.Property(e => e.Type)
                   .HasColumnName("type");

            builder.Property(e => e.SerialNumber)
                   .HasColumnName("serial_number");

            builder.Property(e => e.Brand)
                   .HasColumnName("brand");

            builder.Property(e => e.Cost)
                   .HasColumnName("cost");

            builder.Property(e => e.Location)
                   .HasColumnName("location");

            builder.Property(e => e.WarrantyStart)
                   .HasColumnName("warranty_start");

            builder.Property(e => e.WarrantyEnd)
                   .HasColumnName("warranty_end");
            builder.Property(e => e.Supplier)
                  .HasColumnName("supplier");

            builder.Property(e => e.Description)
                   .HasColumnName("description");

            builder.Property(e => e.Warranty)
                   .HasColumnName("warranty");

            builder.Property(e => e.Vendor)
                   .HasColumnName("vendor");

            builder.Property(e => e.Category)
                   .HasColumnName("category");

            builder.Property(e => e.IsActive)
                   .HasColumnName("isactive")
                   .HasDefaultValue(true); // Default value for IsActive

            builder.Property(e => e.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(e => e.CreateBy)
                   .HasColumnName("create_by");

            builder.Property(e => e.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(e => e.UpdateBy)
                   .HasColumnName("update_by");

            builder.Property(e => e.EmployeeId)
                .HasColumnName("employee_id");
            builder.Property(e => e.Status)
               .HasColumnName("status");
            builder.Property(e => e.Condition)
               .HasColumnName("condition");
            builder.Property(e => e.AssetCode)
                   .HasColumnName("asset_code");
            builder.Property(e => e.AssetModel)
                  .HasColumnName("asset_model");
            builder.Property(e => e.AssignedDate)
                  .HasColumnName("assigned_date");
            builder.Property(e => e.ProductNo)
                  .HasColumnName("product_no");
            builder.Property(e => e.AssetImg1)
                  .HasColumnName("asset_img1");
            builder.Property(e => e.AssetImg2)
                  .HasColumnName("asset_img2");
            builder.Property(e => e.AssetImg3)
                  .HasColumnName("asset_img3");
            builder.Property(e => e.AssetImg4)
                  .HasColumnName("asset_img4");
            builder.HasOne(e => e.Employee) // Assuming you have navigation property
                          .WithMany() // Adjust if Employee has many Assets
                          .HasForeignKey(e => e.EmployeeId);
        }
    }
}


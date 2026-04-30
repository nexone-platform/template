using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Middlewares.Models;

namespace Middlewares.Configurations
{
    public class OtTypeConfiguration : IEntityTypeConfiguration<OtType>
    {
        public void Configure(EntityTypeBuilder<OtType> builder)
        {

            builder.HasKey(e => e.OtTypeId)
                .HasName("ot_type_pkey");

            builder.Property(e => e.OtTypeId)
                .HasColumnName("ot_type_id")  // Explicit column name
                .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-ot-type'::regclass)");

            builder.Property(e => e.OtTypeNameTh)
                .HasColumnName("ot_type_name_th")  // Explicit column name
                .HasMaxLength(100);

            builder.Property(e => e.OtTypeCode)
                .HasColumnName("ot_type_code")  // Explicit column name
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(e => e.OtTypeNameEn)
                .HasColumnName("ot_type_name_en")  // Explicit column name
                .HasMaxLength(100);

            builder.Property(e => e.Value)
                .HasColumnName("value");  // Explicit column name, ensure this matches the database column name

            builder.Property(e => e.IsActive)
                .HasColumnName("isactive")  // Explicit column name
                .HasDefaultValue(true);

            builder.Property(e => e.CreateDate)
                .HasColumnName("create_date")  // Explicit column name
                .HasColumnType("timestamp");

            builder.Property(e => e.CreateBy)
                .HasColumnName("create_by")  // Explicit column name
                .HasMaxLength(50);

            builder.Property(e => e.UpdateDate)
                .HasColumnName("update_date")  // Explicit column name
                .HasColumnType("timestamp");

            builder.Property(e => e.UpdateBy)
                .HasColumnName("update_by")  // Explicit column name
                .HasMaxLength(50);

            builder.HasIndex(e => e.OtTypeCode)
                .IsUnique()
                .HasDatabaseName("mst_ot_type_unique");
        }
    }

}

using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middlewares.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Configurations
{
    public class TaxDeductionTypeConfiguration : IEntityTypeConfiguration<TaxDeductionType>
    {
        public void Configure(EntityTypeBuilder<TaxDeductionType> builder)
        {

            builder.HasKey(x => x.TaxDeductionTypeId)
                   .HasName("ix-pk-tax-deduction-type");

            builder.Property(x => x.TaxDeductionTypeId).HasColumnName("tax_deduction_type_id");

            builder.Property(x => x.TaxDeductionTypeNameTh)
                   .HasColumnName("tax_deduction_type_name_th")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(x => x.TaxDeductionTypeNameEn)
                   .HasColumnName("tax_deduction_type_name_en")
                   .HasMaxLength(100);

            builder.Property(x => x.TaxDeductionTypeCode)
                   .HasColumnName("tax_deduction_type_code")
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(x => x.MaxAmount)
                   .HasColumnName("max_amount")
                   .HasColumnType("NUMERIC(10, 2)")
                   .IsRequired();

            builder.Property(x => x.IsActive)
                   .HasColumnName("isactive")
                   .IsRequired();

            builder.Property(x => x.CreateDate).HasColumnName("create_date");
            builder.Property(x => x.CreateBy).HasColumnName("create_by").HasMaxLength(50);
            builder.Property(x => x.UpdateDate).HasColumnName("update_date");
            builder.Property(x => x.UpdateBy).HasColumnName("update_by").HasMaxLength(50);

            builder.Property(x => x.EffectiveDateStart)
                   .HasColumnName("effective_date_start")
                   .IsRequired()
                   .HasDefaultValueSql("CURRENT_DATE");

            builder.Property(x => x.EffectiveDateEnd)
                   .HasColumnName("effective_date_end")
                   .IsRequired(false);
        }
    }
}

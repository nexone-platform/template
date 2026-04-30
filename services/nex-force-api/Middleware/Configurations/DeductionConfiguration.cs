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
    public class DeductionConfiguration : IEntityTypeConfiguration<Deduction>
    {
        public void Configure(EntityTypeBuilder<Deduction> builder)
        {

            builder.HasKey(e => e.DeductionId)
                   .HasName("ix_pk_deduction");

            builder.Property(e => e.DeductionId)
                   .HasColumnName("deduction_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".hr-sq-deduction-id'::regclass)");

            builder.Property(e => e.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(e => e.CreateBy)
                   .HasColumnName("create_by")
                   .HasMaxLength(50);

            builder.Property(e => e.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(e => e.UpdateBy)
                   .HasColumnName("update_by")
                   .HasMaxLength(50);

            builder.Property(e => e.DeductionName)
                   .HasColumnName("deduction_name");

            builder.Property(e => e.DeductionCode)
                   .HasColumnName("deduction_code");

            builder.Property(e => e.IsActive)
                   .HasColumnName("is_active")
                   .HasDefaultValue(true);

            builder.Property(a => a.PercentAmount)
                    .HasColumnName("unit_amount");

            builder.Property(a => a.UnitAmount)
                   .HasColumnName("percent_amount");
            builder.Property(e => e.DeductionType)
                    .HasColumnName("deduction_type");
        }
    }
}

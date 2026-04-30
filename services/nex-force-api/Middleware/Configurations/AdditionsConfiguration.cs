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
    public class AdditionsConfiguration : IEntityTypeConfiguration<Additions>
    {
        public void Configure(EntityTypeBuilder<Additions> builder)
        {

            builder.HasKey(a => a.AdditionsId)
                   .HasName("ix_pk_additions");

            builder.Property(a => a.AdditionsId)
                   .HasColumnName("additions_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".hr-sq-additions'::regclass)");

            builder.Property(a => a.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(a => a.CreateBy)
                   .HasColumnName("create_by")
                   .HasMaxLength(50);

            builder.Property(a => a.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(a => a.UpdateBy)
                   .HasColumnName("update_by")
                   .HasMaxLength(50);

            builder.Property(a => a.AdditionsName)
                   .HasColumnName("additions_name");

            builder.Property(a => a.AdditionsCode)
                   .HasColumnName("additions_code");

            builder.Property(a => a.AdditionsCategory)
                   .HasColumnName("additions_category");

            builder.Property(a => a.IsActive)
                   .HasColumnName("is_active")
                   .HasDefaultValue(true);

            builder.Property(a => a.PercentAmount)
                   .HasColumnName("unit_amount");

            builder.Property(a => a.UnitAmount)
                   .HasColumnName("percent_amount");
            builder.Property(e => e.AdditionType)
                  .HasColumnName("addition_type");
        }
    }
}

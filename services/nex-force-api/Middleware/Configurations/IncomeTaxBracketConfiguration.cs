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
    public class IncomeTaxBracketConfiguration : IEntityTypeConfiguration<IncomeTaxBracket>
    {
        public void Configure(EntityTypeBuilder<IncomeTaxBracket> builder)
        {

            builder.HasKey(e => e.IncomeTaxBracketId);

            builder.Property(e => e.IncomeTaxBracketId)
                .HasColumnName("income_tax_brackets_id")
                .ValueGeneratedOnAdd();

            builder.Property(e => e.CreateDate)
                .HasColumnName("create_date");

            builder.Property(e => e.CreatedBy)
                .HasColumnName("create_by");

            builder.Property(e => e.UpdateDate)
                .HasColumnName("update_date");

            builder.Property(e => e.UpdatedBy)
                .HasColumnName("update_by");

            builder.Property(e => e.IsActive)
                .HasColumnName("isactive");

            builder.Property(e => e.MinIncome)
                .HasColumnName("min_income");

            builder.Property(e => e.MaxIncome)
                .HasColumnName("max_income");

            builder.Property(e => e.TaxRate)
                .HasColumnName("tax_rate");

            builder.Property(e => e.EffectiveDateStart)
                .HasColumnName("effective_date_start");

            builder.Property(e => e.EffectiveDateEnd)
                .HasColumnName("effective_date_end");
            builder.Property(e => e.Reason)
               .HasColumnName("reason");
        }
    }
}

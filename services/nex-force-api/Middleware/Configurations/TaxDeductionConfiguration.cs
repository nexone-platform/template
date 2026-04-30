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
    public class TaxDeductionConfiguration : IEntityTypeConfiguration<TaxDeduction>
    {
        public void Configure(EntityTypeBuilder<TaxDeduction> builder)
        {

            builder.HasKey(x => x.TaxDeductionId)
                   .HasName("ix-pk-tax-deduction");

            builder.Property(x => x.TaxDeductionId)
                   .HasColumnName("tax_deduction_id");

            builder.Property(x => x.EmployeeId)
                   .HasColumnName("employee_id");

            builder.Property(x => x.TaxDeductionTypeId).HasColumnName("tax_deduction_type_id");

            builder.Property(x => x.DeductionAmount)
                   .HasColumnName("deduction_amount");

            builder.Property(x => x.DeductionDate)
                   .HasColumnName("deduction_date")
                   .HasDefaultValueSql("CURRENT_DATE")
                   .IsRequired();

            builder.Property(x => x.CreateDate).HasColumnName("create_date");
            builder.Property(x => x.CreateBy).HasColumnName("create_by");
            builder.Property(x => x.UpdateDate).HasColumnName("update_date");
            builder.Property(x => x.UpdateBy).HasColumnName("update_by");


            builder.Property(x => x.EffectiveDateStart)
               .HasColumnName("effective_date_start");

            builder.Property(x => x.EffectiveDateEnd)
                   .HasColumnName("effective_date_end");

            builder.Property(x => x.Reason)
                   .HasColumnName("reason");
        }
    }
}

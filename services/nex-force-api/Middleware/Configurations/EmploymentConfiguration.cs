using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Middlewares.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Configurations
{
    public class EmploymentConfiguration : IEntityTypeConfiguration<Employment>
    {
        public void Configure(EntityTypeBuilder<Employment> builder)
        {
            builder.HasKey(e => e.EmploymentId)
                   .HasName("employment_pkey");

            builder.Property(e => e.EmploymentId)
                   .HasColumnName("employment_id").HasDefaultValueSql("nextval('\"solution-one\".emp-sq-employment-id'::regclass)");

            builder.Property(e => e.EmployeeId)
                   .HasColumnName("employee_id");

            builder.Property(e => e.DesignationId)
                   .HasColumnName("designation_id");

            builder.Property(e => e.Salary)
                   .HasColumnName("salary");

            builder.Property(e => e.EffectiveDate)
                   .HasColumnName("effective_date");

            builder.Property(e => e.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(e => e.CreateBy)
                   .HasColumnName("create_by")
                   .HasMaxLength(50);

            builder.Property(e => e.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(e => e.UpdateBy)
                   .HasColumnName("update_by");

            builder.Property(e => e.EmployeeTypeId)
                   .HasColumnName("employee_type_id");

            builder.Property(e => e.PaymentTypeId)
                   .HasColumnName("payment_type_id");

            builder.Property(e => e.UpdateBy)
                   .HasColumnName("update_by");
        }
    }
}

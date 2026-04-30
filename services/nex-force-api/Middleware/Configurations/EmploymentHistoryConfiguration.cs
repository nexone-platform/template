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
    public class EmploymentHistoryConfiguration : IEntityTypeConfiguration<EmploymentHistory>
    {
        public void Configure(EntityTypeBuilder<EmploymentHistory> builder)
        {

            builder.HasKey(eh => eh.HistoryId)
                   .HasName("employment_history_pkey");
      
            builder.Property(eh => eh.HistoryId)
                   .HasColumnName("history_id").HasDefaultValueSql("nextval('\"solution-one\".emp-sq-employment-history'::regclass)");
            builder.Property(eh => eh.EmploymentId)
                   .HasColumnName("employment_id");

            builder.Property(eh => eh.EmployeeId)
                   .HasColumnName("employee_id");

            builder.Property(eh => eh.DesignationId)
                   .HasColumnName("designation_id")
                   .HasColumnType("int4");

            builder.Property(eh => eh.Salary)
                   .HasColumnName("salary");

            builder.Property(eh => eh.EffectiveDateStart)
                   .HasColumnName("effective_date_start");

            builder.Property(eh => eh.EffectiveDateEnd)
                   .HasColumnName("effective_date_end");

            builder.Property(eh => eh.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(eh => eh.CreateBy)
                   .HasColumnName("create_by");

            builder.Property(e => e.EmployeeTypeId)
                    .HasColumnName("employee_type_id");

            builder.Property(e => e.PaymentTypeId)
                    .HasColumnName("payment_type_id");

        }
    }
}

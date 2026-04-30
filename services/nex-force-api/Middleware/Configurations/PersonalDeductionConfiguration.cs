using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Middlewares.Models;
using SharpCompress.Common;

namespace Middlewares.Configurations
{
    public class PersonalDeductionConfiguration : IEntityTypeConfiguration<PersonalDeduction>
    {
        public void Configure(EntityTypeBuilder<PersonalDeduction> builder)
        {


            // Define the primary key
            builder.HasKey(pd => pd.PersonalDeductionId)
                .HasName("ix_pk_personal_deduction");

            // Define column properties
            builder.Property(pd => pd.PersonalDeductionId)
                .HasColumnName("personal_deduction_id").HasDefaultValueSql("nextval('\"solution-one\".hr-sq-personal-deduction-id'::regclass)"); // Adjust sequence name if needed

            builder.Property(pd => pd.EmployeeId)
                .HasColumnName("employee_id");

            builder.Property(pd => pd.DeductionName)
                .HasColumnName("deduction_name");

            builder.Property(pd => pd.DeductionAmount)
                .HasColumnName("deduction_amount");

            builder.Property(pd => pd.DeductionDate)
                .HasColumnName("deduction_date");

            builder.Property(pd => pd.MonthYear)
                .HasColumnName("month_year");

            builder.Property(pd => pd.IsActive)
                .HasColumnName("is_active");

            builder.Property(pd => pd.CreateDate)
                .HasColumnName("create_date");

            builder.Property(pd => pd.CreateBy)
                .HasColumnName("create_by");

            builder.Property(pd => pd.UpdateDate)
                .HasColumnName("update_date");

            builder.Property(pd => pd.UpdateBy)
                .HasColumnName("update_by");

            builder.Property(p => p.PayrollId)
                .HasColumnName("payroll_id");

            builder.Property(e => e.DeductionType)
             .HasColumnName("deduction_type");
        }
    }
}

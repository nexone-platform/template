using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;
using Middlewares.Models;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore.Infrastructure;
using SharpCompress.Common;

namespace Middleware.Configurations
{
    public class PersonalAdditionalConfiguration : IEntityTypeConfiguration<PersonalAdditional>
    {
        public void Configure(EntityTypeBuilder<PersonalAdditional> builder)
        {
            builder.HasKey(e => e.PersonalAdditionId);

            builder.Property(e => e.PersonalAdditionId)
                   .HasColumnName("personal_addition_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".hr-sq-personal-additional-id'::regclass)"); // Adjust sequence name if needed

            builder.Property(e => e.EmployeeId)
                   .HasColumnName("employee_id");

            builder.Property(e => e.AdditionName)
                   .HasColumnName("addition_name");

            builder.Property(e => e.AdditionAmount)
                   .HasColumnName("addition_amount");

            builder.Property(e => e.AdditionDate)
                   .HasColumnName("addition_date");

            builder.Property(e => e.MonthYear)
                   .HasColumnName("month_year");

            builder.Property(e => e.IsActive)
                   .HasColumnName("is_active");

            builder.Property(e => e.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(e => e.CreateBy)
                   .HasColumnName("create_by");

            builder.Property(e => e.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(e => e.UpdateBy)
                   .HasColumnName("update_by");

            builder.Property(p => p.PayrollId)
                .HasColumnName("payroll_id");

            builder.Property(e => e.AdditionType)
              .HasColumnName("addition_type");
        }
    }
}


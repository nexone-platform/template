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
    public class PayrollConfiguration : IEntityTypeConfiguration<Payroll>
    {
        public void Configure(EntityTypeBuilder<Payroll> builder)
        {
     
            builder.HasKey(p => p.PayrollId)
                .HasName("ix_pk_payroll");

            // Define column properties
            builder.Property(p => p.PayrollId)
                .HasColumnName("payroll_id").HasDefaultValueSql("nextval('\"solution-one\".hr-sq-payroll-id'::regclass)");

            builder.Property(p => p.EmployeeId)
                .HasColumnName("employee_id");

            builder.Property(p => p.MonthYear)
                .HasColumnName("month_year");

            builder.Property(p => p.Salary)
                .HasColumnName("salary");

            builder.Property(p => p.TotalAdditions)
                .HasColumnName("total_additions");
            builder.Property(p => p.TotalDeductions)
                .HasColumnName("total_deductions");

            builder.Property(p => p.NetSalary)
             .HasColumnName("net_salary");
            builder.Property(p => p.CreateDate)
                .HasColumnName("create_date");

            builder.Property(p => p.CreateBy)
                .HasColumnName("create_by");
            builder.Property(p => p.UpdateDate)
                .HasColumnName("update_date");
            builder.Property(p => p.UpdateBy)
                .HasColumnName("update_by");
            builder.Property(p => p.PayDate)
                .HasColumnName("pay_date");
            builder.Property(p => p.Remark)
              .HasColumnName("remark");
            builder.Property(p => p.PayrollCode)
                .HasColumnName("payroll_code");

            builder.Property(p => p.PaymentStatus)
                .HasColumnName("payment_status");

            builder.Property(p => p.PeriodId)
                .HasColumnName("period_id");

            builder.Property(p => p.SocialSecurity)
                .HasColumnName("social_security");
            builder.Property(p => p.Tax401)
                .HasColumnName("tax401");
            builder.Property(p => p.Tax402)
                .HasColumnName("tax402");

            builder.Property(p => p.SocialSecurityRate)
                .HasColumnName("social_security_rate");
        }
    }
}

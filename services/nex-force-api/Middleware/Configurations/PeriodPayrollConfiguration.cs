using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middlewares.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SharpCompress.Common;
using static Middlewares.Constant.StatusConstant;

namespace Middlewares.Configurations
{
    public class PeriodPayrollConfiguration : IEntityTypeConfiguration<PeriodPayroll>
    {
        public void Configure(EntityTypeBuilder<PeriodPayroll> builder)
        {
     
            builder.HasKey(p => p.PeriodId)
                .HasName("ix_pk_Period");

            // Define column properties
            builder.Property(p => p.PeriodId)
                .HasColumnName("payroll_id").HasDefaultValueSql("nextval('\"solution-one\".hr-sq-period-id'::regclass)");

            builder.Property(p => p.PeriodId).HasColumnName("period_id");
            builder.Property(p => p.PeriodStartDate).HasColumnName("period_start_date");
            builder.Property(p => p.PeriodEndDate).HasColumnName("period_end_date");
            builder.Property(p => p.MonthYear).HasColumnName("month_year");
            builder.Property(p => p.CreateDate).HasColumnName("create_date");
            builder.Property(p => p.CreateBy).HasColumnName("create_by");
            builder.Property(p => p.UpdateDate).HasColumnName("update_date");
            builder.Property(p => p.UpdateBy).HasColumnName("update_by");
            builder.Property(p => p.TotalCost)
             .HasColumnName("total_cost");

            builder.Property(p => p.TotalPayment)
                   .HasColumnName("total_payment");

            builder.Property(p => p.Status)
                   .HasColumnName("status");

            builder.Property(p => p.PaymentDate)
                   .HasColumnName("payment_date");
            builder.Property(p => p.PaymentChannel)
                   .HasColumnName("payment_channel");
            builder.Property(p => p.PaymentTypeId)
                   .HasColumnName("payment_type_id");
            builder.Property(p => p.Reason)
                  .HasColumnName("reason");
        }
    }
    
}

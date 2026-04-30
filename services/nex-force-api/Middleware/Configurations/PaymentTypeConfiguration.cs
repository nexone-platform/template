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
    public class PaymentTypeConfiguration
     : IEntityTypeConfiguration<PaymentType>
    {
        public void Configure(EntityTypeBuilder<PaymentType> builder)
        {
            builder.ToTable("emp-tb-ms-payment-type", "solution-one");

            builder.HasKey(pt => pt.PaymentTypeId);

            builder.Property(pt => pt.PaymentTypeId)
                   .HasColumnName("payment_type_id");

            builder.Property(pt => pt.PaymentTypeNameTh)
                   .HasColumnName("payment_type_name_th")
                   .IsRequired();

            builder.Property(pt => pt.PaymentTypeNameEn)
                   .HasColumnName("payment_type_name_en")
                   .IsRequired();

            builder.Property(pt => pt.PaymentTypeCode)
                   .HasColumnName("payment_type_code");

            builder.Property(pt => pt.IsActive)
                   .HasColumnName("is_active");

            builder.Property(pt => pt.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(pt => pt.CreateBy)
                   .HasColumnName("create_by");

            builder.Property(pt => pt.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(pt => pt.UpdateBy)
                   .HasColumnName("update_by");
        }
    }

}

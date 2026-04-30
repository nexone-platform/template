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
    public class BankConfiguration : IEntityTypeConfiguration<Bank>
    {
        public void Configure(EntityTypeBuilder<Bank> builder)
        {


            builder.HasKey(x => x.BankId);

            builder.Property(x => x.BankId)
                   .HasColumnName("bank_id")
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.BankCode)
                   .HasColumnName("bank_code")
                   .HasMaxLength(50);

            builder.Property(x => x.BankNameTh)
                   .HasColumnName("bank_name_th")
                   .HasMaxLength(255);

            builder.Property(x => x.BankNameEn)
                   .HasColumnName("bank_name_en")
                   .HasMaxLength(255);

            builder.Property(x => x.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(x => x.CreateBy)
                   .HasColumnName("create_by")
                   .HasMaxLength(50);

            builder.Property(x => x.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(x => x.UpdateBy)
                   .HasColumnName("update_by")
                   .HasMaxLength(50);

            builder.Property(x => x.Abbreviation)
                   .HasColumnName("abbreviation");
        }
    }
}

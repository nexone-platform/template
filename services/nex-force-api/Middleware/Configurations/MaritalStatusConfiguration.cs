using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middlewares.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Middleware.Models;

namespace Middlewares.Configurations
{
    public class MaritalStatusConfiguration : IEntityTypeConfiguration<MaritalStatus>
    {
        public void Configure(EntityTypeBuilder<MaritalStatus> builder)
        {

            builder.HasKey(e => e.MaritalStatusId)
                .HasName("marital_status_type_pkey");

            builder.Property(e => e.MaritalStatusId)
                .HasColumnName("marital_status_id")
                .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-marital-status'::regclass)")
                .IsRequired();

            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.MaritalStatusName).HasColumnName("marital_status");
            builder.Property(e => e.MaritalStatusCode).HasColumnName("marital_status_code");
        }
    }
}

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
    public class GenderConfiguration : IEntityTypeConfiguration<Gender>
    {
        public void Configure(EntityTypeBuilder<Gender> builder)
        {
  
            builder.HasKey(e => e.GenderId)
                .HasName("gender_type_pkey");

            builder.Property(e => e.GenderId)
                .HasColumnName("gender_id")
                .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-gender-id'::regclass)")
                .IsRequired();

            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.GenderName).HasColumnName("gender");
            builder.Property(e => e.GenderCode).HasColumnName("gender_code");
        }
    }
}

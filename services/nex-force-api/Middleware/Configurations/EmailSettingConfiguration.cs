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
    public class EmailSettingConfiguration : IEntityTypeConfiguration<EmailSetting>
    {
        public void Configure(EntityTypeBuilder<EmailSetting> builder)
        {
            builder.HasKey(e => e.EmailId);

            builder.Property(e => e.EmailId)
                    .HasColumnName("email_id")
                    .HasDefaultValueSql("nextval('\"solution-one\".amd-sq-email-template-id'::regclass)")
                    .IsRequired();
            builder.Property(e => e.IsEnabled)
                   .HasColumnName("is_enabled");

            builder.Property(e => e.Method)
                   .HasColumnName("method")
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(e => e.SmtpServer).HasColumnName("smtp_server");
            builder.Property(e => e.SmtpLogin).HasColumnName("smtp_login");
            builder.Property(e => e.SmtpPassword).HasColumnName("smtp_password");
            builder.Property(e => e.FromName).HasColumnName("from_name");
            builder.Property(e => e.FromEmail).HasColumnName("from_email");
            builder.Property(e => e.ToName).HasColumnName("to_name");
            builder.Property(e => e.ToEmail).HasColumnName("to_email");
            builder.Property(e => e.IsActive).HasColumnName("is_active");

            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.SmtpPort).HasColumnName("smtp_port");
        }
    }
}

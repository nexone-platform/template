using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Middlewares.Models;

namespace Middlewares.Configurations
{
    public class EmailTemplateConfiguration : IEntityTypeConfiguration<EmailTemplate>
    {
        public void Configure(EntityTypeBuilder<EmailTemplate> builder)
        {
            builder.HasKey(e => e.TemplateId)
                 .HasName("ix-pk-email-template");


            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.TemplateId)
                .HasColumnName("template_id")
                .HasDefaultValueSql("nextval('\"solution-one\".amd-sq-email-template-id'::regclass)")
                .IsRequired();

            builder.Property(e => e.Title).HasColumnName("title");
            builder.Property(e => e.EmailContent).HasColumnName("email_content");
            builder.Property(e => e.IsActive).HasColumnName("is_active");
            builder.Property(e => e.TemplateCode).HasColumnName("template_code");
            builder.Property(e => e.LanguageCode).HasColumnName("language_code");
        }
    }
}

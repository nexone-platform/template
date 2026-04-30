using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;

using Middlewares.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Configurations
{
    public class PageConfiguration : IEntityTypeConfiguration<Page>
    {
        public void Configure(EntityTypeBuilder<Page> builder)
        {
            builder.ToTable("adm-tb-ms-pages", "solution-one");

            builder.HasKey(p => p.PagesId)
                   .HasName("adm-tb-ms-pages-pk");

            builder.Property(p => p.PagesId)
                   .HasColumnName("pages_id")
                        .HasDefaultValueSql("nextval('\"solution-one\".amd-sq-pages-id'::regclass)")
                        .IsRequired();

            builder.Property(p => p.PageKey)
                   .HasColumnName("page_key");

            builder.Property(p => p.Description)
                   .HasColumnName("description");

            builder.Property(p => p.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(p => p.CreateBy)
                   .HasColumnName("create_by")
                   .HasMaxLength(50);

            builder.Property(p => p.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(p => p.UpdateBy)
                   .HasColumnName("update_by");
        }
    }
}

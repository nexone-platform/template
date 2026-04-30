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
    public class TerminateTypeConfiguration : IEntityTypeConfiguration<TerminateType>
    {
        public void Configure(EntityTypeBuilder<TerminateType> builder)
        {
            // Primary Key
            builder.HasKey(t => t.TerminateTypeId).HasName("ix-pk-terminate-type");

            // Properties
            builder.Property(t => t.TerminateTypeId)
                .IsRequired()
                .HasColumnName("terminate_type_id");

            builder.Property(t => t.TerminateTypeNameTh)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnName("terminate_type_name_th");

            builder.Property(t => t.TerminateTypeNameEn)
                .HasColumnName("terminate_type_name_en");

            builder.Property(t => t.TerminateTypeCode)
                .IsRequired()
                .HasColumnName("terminate_type_code");

            builder.Property(t => t.IsActive)
                .IsRequired()
                .HasDefaultValue(true)
                .HasColumnName("isactive");

            builder.Property(t => t.CreateDate)
                .HasColumnName("create_date");

            builder.Property(t => t.CreateBy)
                .HasMaxLength(50)
                .HasColumnName("create_by");

            builder.Property(t => t.UpdateDate)
                .HasColumnName("update_date");

            builder.Property(t => t.UpdateBy)
                .HasMaxLength(50)
                .HasColumnName("update_by");

            // Unique Constraint
            builder.HasIndex(t => t.TerminateTypeCode)
                .IsUnique()
                .HasDatabaseName("ix-uk-mst-terminate-type");
        }
    }
}

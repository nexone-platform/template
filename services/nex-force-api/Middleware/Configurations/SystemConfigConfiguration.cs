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
    public class SystemConfigConfiguration : IEntityTypeConfiguration<SystemConfig>
    {
        public void Configure(EntityTypeBuilder<SystemConfig> builder)
        {

            builder.HasKey(x => x.SystemId);

            builder.Property(x => x.SystemId)
                   .HasColumnName("system_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".\"adm-sq-system-id\"'::regclass)");

            builder.Property(x => x.ConfigKey)
                   .HasColumnName("config_key")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.HasIndex(x => x.ConfigKey)
                   .IsUnique();

            builder.Property(x => x.ConfigValue)
                   .HasColumnName("config_value")
                   .HasColumnType("text");

            builder.Property(x => x.ValueType)
                   .HasColumnName("value_type")
                   .HasMaxLength(50)
                   .HasDefaultValue("string");

            builder.Property(x => x.Description)
                   .HasColumnName("description")
                   .HasColumnType("text");

            builder.Property(x => x.IsActive)
                   .HasColumnName("is_active")
                   .HasDefaultValue(true);

            builder.Property(x => x.CreatedAt)
                   .HasColumnName("created_at")
                   .HasDefaultValueSql("NOW()");

            builder.Property(x => x.CreatedBy)
                   .HasColumnName("created_by")
                   .HasMaxLength(100);

            builder.Property(x => x.UpdatedAt)
                   .HasColumnName("updated_at");

            builder.Property(x => x.UpdatedBy)
                   .HasColumnName("updated_by")
                   .HasMaxLength(100);
        }
    }
}

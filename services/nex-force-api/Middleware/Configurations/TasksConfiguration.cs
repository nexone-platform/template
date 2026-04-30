using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Middlewares.Models;

namespace Middlewares.Configurations
{
    public class TasksConfiguration : IEntityTypeConfiguration<Tasks>
    {
        public void Configure(EntityTypeBuilder<Tasks> builder)
        {

            builder.HasKey(e => e.TaskId)
                   .HasName("ix-pk-task");

            builder.HasIndex(e => e.TaskCode)
                   .IsUnique()
                   .HasDatabaseName("ix-uk-task");

            builder.Property(e => e.TaskId)
                   .HasColumnName("task_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".\"emp-sq-task-id\"'::regclass)");

            builder.Property(e => e.TaskNameTh)
                   .HasColumnName("task_name_th");

            builder.Property(e => e.TaskNameEn)
                   .HasColumnName("task_name_en");

            builder.Property(e => e.TaskCode)
                   .HasColumnName("task_code");

            builder.Property(e => e.IsActive)
                   .HasColumnName("isactive");

            builder.Property(e => e.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(e => e.CreateBy)
                   .HasColumnName("create_by");

            builder.Property(e => e.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(e => e.UpdateBy)
                   .HasColumnName("update_by");
        }
    }
}

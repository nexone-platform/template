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
    public class TerminateConfiguration : IEntityTypeConfiguration<Terminate>
    {
        public void Configure(EntityTypeBuilder<Terminate> builder)
        {
            // Primary Key
            builder.HasKey(t => t.TerminateId).HasName("ix-pk_terminate_id");

            // Properties
            builder.Property(t => t.TerminateId)
                .IsRequired()
                .HasColumnName("terminate_id");

            builder.Property(t => t.TerminateTypeId)
                .HasColumnName("terminate_type_id");

            builder.Property(t => t.EmployeeId)
                .HasColumnName("employee_id");

            builder.Property(t => t.NoticeDate)
                .HasColumnName("notice_date");

            builder.Property(t => t.TerminateDate)
                .HasColumnName("terminate_date");

            builder.Property(t => t.Reason)
                .HasColumnName("reason");

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

            builder.Property(t => t.RefId).HasColumnName("ref_id");
        }
    }
}

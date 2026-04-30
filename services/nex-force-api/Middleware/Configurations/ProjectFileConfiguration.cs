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
    public class ProjectFileConfiguration : IEntityTypeConfiguration<ProjectFile>
    {
        public void Configure(EntityTypeBuilder<ProjectFile> builder)
        {
            builder.HasKey(x => x.FileId);

            builder.Property(x => x.FileId)
                   .HasColumnName("file_id");

            builder.Property(x => x.ProjectId)
                   .HasColumnName("project_id")
                   .IsRequired();

            builder.Property(x => x.FileCategory)
                   .HasColumnName("file_category")
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(x => x.OriginalName)
                   .HasColumnName("original_name")
                   .HasMaxLength(255);

            builder.Property(x => x.StoredName)
                   .HasColumnName("stored_name")
                   .HasMaxLength(255);

            builder.Property(x => x.FilePath)
                   .HasColumnName("file_path");

            builder.Property(x => x.FileSize)
                   .HasColumnName("file_size");

            builder.Property(x => x.FileType)
                   .HasColumnName("file_type")
                   .HasMaxLength(50);

            builder.Property(x => x.CreateDate)
                   .HasColumnName("create_date")
                   .HasDefaultValueSql("now()");

            builder.Property(x => x.CreateBy)
                   .HasColumnName("create_by")
                   .HasMaxLength(50);

            builder.Property(x => x.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(x => x.UpdateBy)
                   .HasColumnName("update_by")
                   .HasMaxLength(50);



        }
    }
}


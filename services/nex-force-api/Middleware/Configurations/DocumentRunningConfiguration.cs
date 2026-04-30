using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class DocumentRunningConfiguration : IEntityTypeConfiguration<DocumentRunning>
    {
        public void Configure(EntityTypeBuilder<DocumentRunning> builder)
        {

            // Primary key
            builder.HasKey(e => e.DocumentId);

            builder.Property(e => e.DocumentId)
                  .HasColumnName("document_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".adm-tb-ms-document-running-control_document_id_seq'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.DocumentType).HasColumnName("document_type");
            builder.Property(e => e.Description).HasColumnName("description");
            builder.Property(e => e.Prefix).HasColumnName("prefix");
            builder.Property(e => e.FormatDate).HasColumnName("format_date");
            builder.Property(e => e.Suffix).HasColumnName("suffix");
            builder.Property(e => e.DigitNumber).HasColumnName("digit_number"); 
            builder.Property(e => e.Running).HasColumnName("running");
        }
    }
}

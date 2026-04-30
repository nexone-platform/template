using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

using Middlewares.Models;


namespace Middleware.Configurations
{
    public class LogsConfiguration : IEntityTypeConfiguration<Logs>
    {
        public void Configure(EntityTypeBuilder<Logs> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Id)
                   .HasColumnName("logs_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-logs-id'::regclass)"); // Adjust sequence name if needed

            builder.Property(e => e.ErrorMessageTh)
                   .HasColumnName("errormessageth")
                   .IsRequired();

            builder.Property(e => e.ErrorMessageEn)
                   .HasColumnName("errormessageen");

            builder.Property(e => e.PageName)
                   .HasColumnName("pagename");

            builder.Property(e => e.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(e => e.CreateBy)
                   .HasColumnName("create_by");

        }
    }
}


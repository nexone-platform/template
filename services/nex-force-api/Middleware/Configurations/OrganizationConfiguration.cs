using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;
using SharpCompress.Common;

namespace Middleware.Configurations
{
    public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
    {
        public void Configure(EntityTypeBuilder<Organization> builder)
        {

            // Primary key
            builder.HasKey(e => e.OrganizationId);
            builder.Property(e => e.OrganizationId)
              .HasColumnName("organization_id")
              .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-organization'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.OrganizationNameEn).HasColumnName("organization_name_en");
            builder.Property(e => e.OrganizationNameTh).HasColumnName("organization_name_th");
            builder.Property(e => e.IsActive).HasColumnName("isactive");
            builder.Property(e => e.OrganizationCode).HasColumnName("organization_code");
            builder.Property(e => e.Address).HasColumnName("address");
            builder.Property(e => e.Country).HasColumnName("country");
            builder.Property(e => e.City).HasColumnName("city");
            builder.Property(e => e.ContactPerson).HasColumnName("contact_person");
            builder.Property(e => e.State).HasColumnName("state");
            builder.Property(e => e.PostalCode).HasColumnName("postal_code");
            builder.Property(e => e.Email).HasColumnName("email");
            builder.Property(e => e.Phone).HasColumnName("phone");
            builder.Property(e => e.Fax).HasColumnName("fax");
            builder.Property(e => e.Url).HasColumnName("url");
            builder.Property(e => e.Logo).HasColumnName("logo");
            builder.Property(e => e.Favicon).HasColumnName("favicon");
            builder.Property(e => e.TaxNo).HasColumnName("tax_no");
        }
    }
}

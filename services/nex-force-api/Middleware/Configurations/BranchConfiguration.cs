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
    public class BranchConfiguration : IEntityTypeConfiguration<Branch>
    {
        public void Configure(EntityTypeBuilder<Branch> builder)
        {
            builder.ToTable("emp-tb-ms-branch", "solution-one");

            builder.HasKey(b => b.BranchId)
                   .HasName("emp-tb-ms-branch_pkey");

            builder.Property(b => b.BranchId)
                   .HasColumnName("branch_id")
               .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-branch-id'::regclass)");

            builder.Property(b => b.BranchNameTh)
                   .HasColumnName("branch_name_th")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(b => b.BranchNameEn)
                   .HasColumnName("branch_name_en")
                   .HasMaxLength(100);

            builder.Property(b => b.BranchCode)
                   .HasColumnName("branch_code")
                   .HasMaxLength(50);

            builder.HasIndex(b => b.BranchCode)
                   .IsUnique()
                   .HasDatabaseName("emp-tb-ms-branch_branch_code_key");

            builder.Property(b => b.OrganizationId)
                   .HasColumnName("organization_id")
                   .IsRequired();

            builder.Property(b => b.Address)
                   .HasColumnName("address");

            builder.Property(b => b.Country)
                   .HasColumnName("country");

            builder.Property(b => b.City)
                   .HasColumnName("city");

            builder.Property(b => b.ContactPerson)
                   .HasColumnName("contact_person");

            builder.Property(b => b.State)
                   .HasColumnName("state");

            builder.Property(b => b.PostalCode)
                   .HasColumnName("postal_code");

            builder.Property(b => b.Email)
                   .HasColumnName("email");

            builder.Property(b => b.Phone)
                   .HasColumnName("phone");

            builder.Property(b => b.Fax)
                   .HasColumnName("fax");

            builder.Property(b => b.IsActive)
                   .HasColumnName("isactive")
                   .HasDefaultValue(true)
                   .IsRequired();

            builder.Property(b => b.TaxNo)
                   .HasColumnName("tax_no");

            builder.Property(b => b.Logo)
                   .HasColumnName("logo");

            builder.Property(b => b.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(b => b.CreateBy)
                   .HasColumnName("create_by")
                   .HasMaxLength(50);

            builder.Property(b => b.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(b => b.UpdateBy)
                   .HasColumnName("update_by")
                   .HasMaxLength(50);

            builder.HasOne(b => b.Organization)
                   .WithMany()
                   .HasForeignKey(b => b.OrganizationId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .HasConstraintName("fk_organization");
        }
    }
}

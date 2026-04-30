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
    public class ClientConfiguration : IEntityTypeConfiguration<Client>
    {
        public void Configure(EntityTypeBuilder<Client> builder)
        {
            builder.HasKey(c => c.ClientId);

            builder.Property(c => c.ClientId)
                .HasColumnName("client_id")
                .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-client-id'::regclass)"); // Adjust sequence name if needed

            builder.Property(c => c.ClientCode)
                .HasColumnName("client_code");

            builder.Property(c => c.Company)
                    .HasColumnName("company");

            builder.Property(c => c.Address)
                   .HasColumnName("address");

            builder.Property(c => c.TaxId)
                .HasColumnName("tax_id");

            builder.Property(c => c.HeadOffice)
                .HasColumnName("head_office");

            builder.Property(e => e.BranchNo).HasColumnName("branch_no");

            builder.Property(c => c.BranchName)
                .HasColumnName("branch_name");

            builder.Property(c => c.CreditTerm)
                .HasColumnName("credit_term");

            builder.Property(c => c.OfficeNo)
              .HasColumnName("office_no");

            builder.Property(c => c.ImgPath)
              .HasColumnName("img_path");

            builder.Property(c => c.ContractName)
               .HasColumnName("contract_name");

            builder.Property(c => c.ContractNo)
               .HasColumnName("contract_no");

            builder.Property(c => c.ContractEmail)
               .HasColumnName("contract_email");

            builder.Property(c => c.IsActive)
               .HasColumnName("is_active");

            builder.Property(c => c.CreateDate)
                .HasColumnName("create_date");

            builder.Property(c => c.CreateBy)
                .HasColumnName("create_by");

            builder.Property(c => c.UpdateDate)
                .HasColumnName("update_date");

            builder.Property(c => c.UpdateBy)
                .HasColumnName("update_by");
        }
    }
}

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
    public class SocialSecurityRateConfiguration : IEntityTypeConfiguration<SocialSecurityRate>
    {
        public void Configure(EntityTypeBuilder<SocialSecurityRate> builder)
        {
            builder.HasKey(e => e.SocialSecurityId);
            builder.Property(s => s.SocialSecurityId)
                .HasColumnName("social_security_id")
                .HasDefaultValueSql("nextval('\"solution-one\".\"hr-sq-social-security-id\"'::regclass)");

            builder.Property(s => s.StartDate)
                .HasColumnName("start_date");

            builder.Property(s => s.EndDate)
                .HasColumnName("end_date");

            builder.Property(s => s.Percentage)
                .HasColumnName("percentage");

            builder.Property(s => s.Description)
                .HasColumnName("description");

            builder.Property(s => s.IsActive)
                .HasColumnName("is_active");

            builder.Property(s => s.MaxDeduction)
                .HasColumnName("max_deduction");

            builder.Property(s => s.MaxSalary)
                .HasColumnName("max_salary");

            builder.Property(s => s.CreateDate)
                .HasColumnName("create_date");

            builder.Property(s => s.CreateBy)
                .HasColumnName("create_by");

            builder.Property(s => s.UpdateDate)
                .HasColumnName("update_date");

            builder.Property(s => s.UpdateBy)
                .HasColumnName("update_by");
        }
    }
}

using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class ManageApplicantTestingConfiguration : IEntityTypeConfiguration<ManageApplicantTesting>
    {
        public void Configure(EntityTypeBuilder<ManageApplicantTesting> builder)
        {

            // Primary key
            builder.HasKey(e => e.ManageApplicantTestingId);

            builder.Property(e => e.ManageApplicantTestingId)
                  .HasColumnName("manage_applicant_testing_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".adm-sq-manage-applicant-testing-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.ManageResumeId).HasColumnName("manage_resume_id");
            builder.Property(e => e.CategoryId).HasColumnName("category_id");
            builder.Property(e => e.CategoriesJson).HasColumnName("categories_json");
            builder.Property(e => e.Status).HasColumnName("status");
       
        }
    }
}

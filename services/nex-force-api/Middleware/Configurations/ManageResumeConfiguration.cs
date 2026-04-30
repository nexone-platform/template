using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class ManageResumeConfiguration : IEntityTypeConfiguration<ManageResume>
    {
        public void Configure(EntityTypeBuilder<ManageResume> builder)
        {

            // Primary key
            builder.HasKey(e => e.ManageResumeId);

            builder.Property(e => e.ManageResumeId)
                  .HasColumnName("manage_resume_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".adm-sq-manage-resume-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.Title).HasColumnName("title");
            builder.Property(e => e.FirstName).HasColumnName("first_name");
            builder.Property(e => e.LastName).HasColumnName("last_name");
            builder.Property(e => e.Email).HasColumnName("email");
            builder.Property(e => e.Phone).HasColumnName("phone");
            builder.Property(e => e.Gender).HasColumnName("gender");
            builder.Property(e => e.Position).HasColumnName("position");
            builder.Property(e => e.Location).HasColumnName("location");
            builder.Property(e => e.Skills).HasColumnName("skills");
            builder.Property(e => e.Experiences).HasColumnName("experiences");
            builder.Property(e => e.Educations).HasColumnName("educations");        }
    }
}

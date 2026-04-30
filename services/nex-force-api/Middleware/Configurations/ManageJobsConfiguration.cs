using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middleware;

namespace Middleware.Configurations
{
    public class ManageJobsConfiguration : IEntityTypeConfiguration<ManageJobs>
    {
        public void Configure(EntityTypeBuilder<ManageJobs> builder)
        {

            // Primary key
            builder.HasKey(e => e.ManageJobId);

            builder.Property(e => e.ManageJobId)
                  .HasColumnName("manage_job_id")
                  .HasDefaultValueSql("nextval('\"solution-one\".adm-sq-manage-jobs-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.JobTitle).HasColumnName("job_title");
            builder.Property(e => e.Department).HasColumnName("department");
            builder.Property(e => e.JobLocation).HasColumnName("job_location");
            builder.Property(e => e.EmploymentType).HasColumnName("employment_type");
            builder.Property(e => e.Description).HasColumnName("description");
            builder.Property(e => e.FirstName).HasColumnName("first_name");
            builder.Property(e => e.LastName).HasColumnName("last_name");
            builder.Property(e => e.Email).HasColumnName("email");
            builder.Property(e => e.Phone).HasColumnName("phone");
            builder.Property(e => e.PortfolioUrl).HasColumnName("portfolio_url");
            builder.Property(e => e.Experience).HasColumnName("experience");
            builder.Property(e => e.SalaryFrom).HasColumnName("salary_from");
            builder.Property(e => e.SalaryTo).HasColumnName("salary_to");
            builder.Property(e => e.StartDate).HasColumnName("start_date");
            builder.Property(e => e.ExpiredDate).HasColumnName("expired_date");
            builder.Property(e => e.Position).HasColumnName("position");
            builder.Property(e => e.Age).HasColumnName("age");
            builder.Property(e => e.Qualification).HasColumnName("qualification");
            builder.Property(e => e.Status).HasColumnName("status");
        }
    }
}

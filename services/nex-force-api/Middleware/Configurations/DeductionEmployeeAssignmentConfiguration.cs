using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using Middleware.Models;
using Middlewares.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Configurations
{
    public class DeductionEmployeeAssignmentConfiguration : IEntityTypeConfiguration<DeductionEmployeeAssignment>
    {
        public void Configure(EntityTypeBuilder<DeductionEmployeeAssignment> builder)
        {

            builder.HasKey(e => e.AssignmentId); // Primary key

            builder.Property(e => e.AssignmentId)
                   .HasColumnName("assignment_id").HasDefaultValueSql("nextval('\"solution-one\".hr-sq-assignment_id'::regclass)");


            builder.Property(e => e.DeductionId)
                   .HasColumnName("deduction_id");

            builder.Property(e => e.AssignmentType)
                   .HasColumnName("assignment_type");

            builder.Property(e => e.EmployeeId)
                   .HasColumnName("employee_id");

            builder.Property(e => e.DepartmentId)
                   .HasColumnName("department_id");

            builder.Property(e => e.ExceptedEmployeeIds)
                   .HasColumnName("excepted_employee_ids");

            builder.Property(e => e.AssignedDate)
                   .HasColumnName("assigned_date");

            builder.Property(e => e.ProjectId)
                   .HasColumnName("project_id");


            builder.Property(e => e.IsActive)
                   .HasColumnName("is_active");

            builder.Property(e => e.CreateDate)
                   .HasColumnName("createdate");

            builder.Property(e => e.CreateBy)
                   .HasColumnName("createby");

            builder.Property(e => e.UpdateDate)
                   .HasColumnName("updatedate");

            builder.Property(e => e.UpdateBy)
                   .HasColumnName("updateby");
        }
    }
}

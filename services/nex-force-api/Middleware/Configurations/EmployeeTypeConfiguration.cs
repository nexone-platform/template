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
    public class EmployeeTypeConfiguration : IEntityTypeConfiguration<EmployeeType>
    {
        public void Configure(EntityTypeBuilder<EmployeeType> builder)
        {
            builder.ToTable("emp-tb-ms-employee-type", "solution-one");

            builder.HasKey(et => et.EmployeeTypeId);

            builder.Property(et => et.EmployeeTypeId)
                   .HasColumnName("employee_type_id");

            builder.Property(et => et.EmployeeTypeNameTh)
                   .HasColumnName("employee_type_name_th");

            builder.Property(et => et.EmployeeTypeNameEn)
                   .HasColumnName("employee_type_name_en");

            builder.Property(et => et.EmployeeTypeCode)
                   .HasColumnName("employee_type_code");

            builder.Property(et => et.IsActive)
                   .HasColumnName("is_active");

            builder.Property(et => et.CreateDate)
                   .HasColumnName("create_date");

            builder.Property(et => et.CreateBy)
                   .HasColumnName("create_by");

            builder.Property(et => et.UpdateDate)
                   .HasColumnName("update_date");

            builder.Property(et => et.UpdateBy)
                   .HasColumnName("update_by");
        }
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Middlewares.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares.Configurations
{
    public class ProjectCostDetailConfiguration : IEntityTypeConfiguration<ProjectCostDetail>
    {
        public void Configure(EntityTypeBuilder<ProjectCostDetail> builder)
        {
            builder.HasKey(x => x.CostDetailId);

            builder.Property(x => x.CostDetailId)
                   .HasColumnName("cost_detail_id").HasDefaultValueSql("nextval('\"solution-one\".emp-sq-project-cost-detail-id'::regclass)");

            builder.Property(x => x.CostId)
                   .HasColumnName("cost_id")
                   .IsRequired();

            builder.Property(x => x.ProjectId)
                   .HasColumnName("project_id")
                   .IsRequired();

            builder.Property(x => x.EmployeeId)
                   .HasColumnName("employee_id")
                   .IsRequired();

            builder.Property(x => x.RoleName)
                   .HasColumnName("role_name")
                   .HasMaxLength(50);

            builder.Property(x => x.CostPerDay)
                   .HasColumnName("cost_per_day")
                   .HasColumnType("numeric(10,2)");

            builder.Property(x => x.MdProject)
                   .HasColumnName("md_project")
                   .HasColumnType("numeric(10,2)");

            builder.Property(x => x.TotalCost)
                   .HasColumnName("total_cost")
                   .HasColumnType("numeric(18,2)");

            builder.Property(x => x.MdUsed)
                   .HasColumnName("md_used")
                   .HasColumnType("numeric(10,2)");

            builder.Property(x => x.RemainMd)
                   .HasColumnName("remain_md")
                   .HasColumnType("numeric(10,2)");

            builder.Property(x => x.ExtraCost)
                   .HasColumnName("extra_cost")
                   .HasColumnType("numeric(18,2)");

            builder.Property(x => x.CreateDate).HasColumnName("create_date");
            builder.Property(x => x.CreateBy).HasColumnName("create_by");
            builder.Property(x => x.UpdateDate).HasColumnName("update_date");
            builder.Property(x => x.UpdateBy).HasColumnName("update_by");
        }
    }
}

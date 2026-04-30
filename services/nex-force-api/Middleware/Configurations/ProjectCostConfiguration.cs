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
    public class ProjectCostConfiguration : IEntityTypeConfiguration<ProjectCost>
    {
        public void Configure(EntityTypeBuilder<ProjectCost> builder)
        {
            builder.HasKey(x => x.CostId);


            builder.Property(e => e.CostId)
                   .HasColumnName("cost_id")
                   .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-project-cost-id'::regclass)");
            
            builder.Property(x => x.ProjectId)
                   .HasColumnName("project_id")
                   .IsRequired();

            builder.Property(x => x.BudgetProject)
                   .HasColumnName("budget_project")
                   .HasColumnType("numeric(18,2)");

            builder.Property(x => x.TotalCost)
                   .HasColumnName("total_cost")
                   .HasColumnType("numeric(18,2)");

            builder.Property(x => x.MdPerMonth)
                   .HasColumnName("md_per_month")
                   .HasColumnType("numeric(10,2)");

            builder.Property(x => x.CreateDate).HasColumnName("create_date");
            builder.Property(x => x.CreateBy).HasColumnName("create_by");
            builder.Property(x => x.UpdateDate).HasColumnName("update_date");
            builder.Property(x => x.UpdateBy).HasColumnName("update_by");
        }
    }
}
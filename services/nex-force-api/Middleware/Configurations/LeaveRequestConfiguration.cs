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
    public class LeaveRequestConfiguration : IEntityTypeConfiguration<LeaveRequest>
    {
        public void Configure(EntityTypeBuilder<LeaveRequest> builder)
        {
            // Primary key
            builder.HasKey(e => e.LeaveRequestId);

            builder.Property(e => e.LeaveRequestId)
                  .HasColumnName("id")
                  .HasDefaultValueSql("nextval('\"solution-one\".emp-sq-leave-request-id'::regclass)");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
            builder.Property(e => e.Status).HasColumnName("status").HasConversion<string>(); 
            builder.Property(e => e.Reason).HasColumnName("reason");
            builder.Property(e => e.StartDate).HasColumnName("start_date");
            builder.Property(e => e.EndDate).HasColumnName("end_date");
            builder.Property(e => e.EmployeeId).HasColumnName("employee_id");
            builder.Property(e => e.LeaveTypeId).HasColumnName("leave_type_id");
            builder.Property(e => e.ApproverId).HasColumnName("approver_id");
            builder.Property(e => e.RequestDate).HasColumnName("request_date");
            builder.Property(e => e.ApprovedDate).HasColumnName("approved_date"); 
            builder.Property(e => e.TotalDays).HasColumnName("total_days");
            builder.Property(e => e.CurrentApprovalLevel).HasColumnName("current_approval_level");
            builder.Property(e => e.Comments).HasColumnName("comments");
            builder.Property(e => e.DayType).HasColumnName("day_type");

            builder.Property(t => t.RefId).HasColumnName("ref_id");
        }
    }
}

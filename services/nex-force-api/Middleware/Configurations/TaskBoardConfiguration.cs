using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Middlewares.Models;

namespace Middlewares.Configurations
{
    public class TaskBoardConfiguration : IEntityTypeConfiguration<TaskBoard>
    {
        public void Configure(EntityTypeBuilder<TaskBoard> builder)
        {
            builder.HasKey(e => e.TaskBoardId);
            builder.Property(e => e.TaskBoardId).HasColumnName("task_board_id");
            builder.Property(e => e.ProjectId).HasColumnName("project_id");
            builder.Property(e => e.TaskId).HasColumnName("task_id");
            builder.Property(e => e.Title).HasColumnName("title");
            builder.Property(e => e.Description).HasColumnName("description");
            builder.Property(e => e.Status).HasColumnName("status");
            builder.Property(e => e.Priority).HasColumnName("priority");
            builder.Property(e => e.AssigneeId).HasColumnName("assignee_id");
            builder.Property(e => e.DueDate).HasColumnName("due_date");
            builder.Property(e => e.StartDate).HasColumnName("start_date");
            builder.Property(e => e.ManDay).HasColumnName("manday");
            builder.Property(e => e.SprintName).HasColumnName("sprint_name");
            builder.Property(e => e.SprintIsActive).HasColumnName("sprint_is_active");
            builder.Property(e => e.SortOrder).HasColumnName("sort_order");
            builder.Property(e => e.CreateDate).HasColumnName("create_date");
            builder.Property(e => e.CreateBy).HasColumnName("create_by");
            builder.Property(e => e.UpdateDate).HasColumnName("update_date");
            builder.Property(e => e.UpdateBy).HasColumnName("update_by");
        }
    }
}

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Middlewares.Models
{
    [Table("emp-tb-ms-task-board")]
    public class TaskBoard
    {
        [Key]
        public int TaskBoardId { get; set; }
        public int ProjectId { get; set; }
        public int? TaskId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; } = "pending"; // pending, progress, completed, review, hold
        public string? Priority { get; set; } = "Medium"; // High, Medium, Low
        public decimal? AssigneeId { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? StartDate { get; set; }
        public decimal? ManDay { get; set; }
        public string? SprintName { get; set; }
        public bool? SprintIsActive { get; set; } = true;
        public int SortOrder { get; set; } = 0;
        public DateTime? CreateDate { get; set; }
        public string? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string? UpdateBy { get; set; }
    }
}

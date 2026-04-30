using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;

namespace solutionAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TaskBoardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILoggingService _loggingService;

        public TaskBoardController(ApplicationDbContext context, ILoggingService loggingService)
        {
            _context = context;
            _loggingService = loggingService;
        }

        // DTO for listing tasks with assignee info
        public class TaskBoardDto
        {
            public int TaskBoardId { get; set; }
            public int ProjectId { get; set; }
            public int? TaskId { get; set; }
            public string? TaskCode { get; set; }
            public string? TaskName { get; set; }
            public string? Title { get; set; }
            public string? Description { get; set; }
            public string? Status { get; set; }
            public string? Priority { get; set; }
            public decimal? AssigneeId { get; set; }
            public string? AssigneeName { get; set; }
            public string? AssigneeImg { get; set; }
            public DateTime? DueDate { get; set; }
            public DateTime? StartDate { get; set; }
            public decimal? ManDay { get; set; }
            public string? SprintName { get; set; }
            public bool? SprintIsActive { get; set; }
            public int SortOrder { get; set; }
            public string? ProjectName { get; set; }
        }

        // DTO for create/update
        public class TaskBoardUpdateDto
        {
            public int TaskBoardId { get; set; }
            public int ProjectId { get; set; }
            public int? TaskId { get; set; }
            public string? Title { get; set; }
            public string? Description { get; set; }
            public string? Status { get; set; }
            public string? Priority { get; set; }
            public decimal? AssigneeId { get; set; }
            public DateTime? DueDate { get; set; }
            public DateTime? StartDate { get; set; }
            public decimal? ManDay { get; set; }
            public string? SprintName { get; set; }
            public int SortOrder { get; set; }
            public string? Username { get; set; }
        }

        // DTO for status update (drag & drop)
        public class StatusUpdateDto
        {
            public int TaskBoardId { get; set; }
            public string? Status { get; set; }
            public int SortOrder { get; set; }
            public string? Username { get; set; }
        }

        // DTO for sprint toggle
        public class SprintToggleDto
        {
            public string? SprintName { get; set; }
            public int? ProjectId { get; set; }
            public bool IsActive { get; set; }
            public string? Username { get; set; }
        }

        /// <summary>
        /// GET taskBoard/myProjects/{employeeId} — Get projects where employee is assigned (LEADER or MEMBER)
        /// Also checks legacy ProjectLeader field
        /// </summary>
        [HttpGet("myProjects/{employeeId}")]
        public async Task<ActionResult> GetMyProjects(int employeeId)
        {
            try
            {
                // From ProjectAssignment table
                var fromAssignment = await (from pa in _context.ProjectAssignments
                                      join p in _context.Projects on pa.ProjectId equals p.ProjectId
                                      where pa.EmployeeId == employeeId && pa.IsActive == true
                                      select new
                                      {
                                          p.ProjectId,
                                          p.ProjectName,
                                          RoleType = pa.RoleType ?? "MEMBER",
                                      }).ToListAsync();

                // From legacy ProjectLeader field
                var fromLeader = await (from p in _context.Projects
                                        where p.ProjectLeader == employeeId
                                        select new
                                        {
                                            p.ProjectId,
                                            p.ProjectName,
                                            RoleType = "LEADER",
                                        }).ToListAsync();

                // Merge and deduplicate by ProjectId
                var projects = fromAssignment
                    .Union(fromLeader)
                    .GroupBy(p => p.ProjectId)
                    .Select(g => g.First())
                    .OrderBy(p => p.ProjectName)
                    .ToList();

                return Ok(projects);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "TaskBoard-GetMyProjects", "System");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        /// <summary>
        /// GET taskBoard/myTasks/{employeeId} — Get incomplete tasks assigned to employee, sorted by priority + dueDate
        /// </summary>
        [HttpGet("myTasks/{employeeId}")]
        public async Task<ActionResult> GetMyTasks(int employeeId, [FromQuery] bool includeCompleted = false)
        {
            try
            {
                // Priority sort order: High=1, Medium=2, Low=3
                var tasks = await (from tb in _context.TaskBoards
                                   join p in _context.Projects on tb.ProjectId equals p.ProjectId into projJoin
                                   from p in projJoin.DefaultIfEmpty()
                                   join e in _context.Employees on tb.AssigneeId equals e.Id into empJoin
                                   from e in empJoin.DefaultIfEmpty()
                                   join t in _context.Tasks on tb.TaskId equals t.TaskId into taskJoin
                                   from t in taskJoin.DefaultIfEmpty()
                                   where tb.AssigneeId == employeeId
                                         && (includeCompleted || tb.Status != "completed")
                                   select new
                                   {
                                       tb.TaskBoardId,
                                       tb.ProjectId,
                                       tb.TaskId,
                                       TaskCode = t != null ? t.TaskCode : null,
                                       TaskName = t != null ? t.TaskNameTh : null,
                                       tb.Title,
                                       tb.Description,
                                       tb.Status,
                                       tb.Priority,
                                       AssigneeName = e != null ? e.FirstNameEn + " " + e.LastNameEn : null,
                                       tb.DueDate,
                                       tb.StartDate,
                                       tb.ManDay,
                                       ProjectName = p != null ? p.ProjectName : null,
                                       PriorityOrder = tb.Priority == "High" ? 1 : tb.Priority == "Medium" ? 2 : 3,
                                   }).ToListAsync();

                var sorted = tasks
                    .OrderBy(t => t.PriorityOrder)
                    .ThenBy(t => t.DueDate ?? DateTime.MaxValue)
                    .Select(t => new
                    {
                        t.TaskBoardId,
                        t.ProjectId,
                        t.TaskId,
                        t.TaskCode,
                        t.TaskName,
                        t.Title,
                        t.Description,
                        t.Status,
                        t.Priority,
                        t.AssigneeName,
                        t.DueDate,
                        t.StartDate,
                        t.ManDay,
                        t.ProjectName,
                    })
                    .ToList();

                return Ok(sorted);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "TaskBoard-GetMyTasks", "System");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        /// <summary>
        /// GET taskBoard/project/{projectId} — Get all tasks for a project
        /// </summary>
        [HttpGet("project/{projectId}")]
        public async Task<ActionResult> GetByProject(int projectId)
        {
            try
            {
                var tasks = await (from tb in _context.TaskBoards
                                   join e in _context.Employees on tb.AssigneeId equals e.Id into empJoin
                                   from e in empJoin.DefaultIfEmpty()
                                   join p in _context.Projects on tb.ProjectId equals p.ProjectId into projJoin
                                   from p in projJoin.DefaultIfEmpty()
                                   join t in _context.Tasks on tb.TaskId equals t.TaskId into taskJoin
                                   from t in taskJoin.DefaultIfEmpty()
                                   where tb.ProjectId == projectId
                                   orderby tb.SortOrder
                                   select new TaskBoardDto
                                   {
                                       TaskBoardId = tb.TaskBoardId,
                                       ProjectId = tb.ProjectId,
                                       TaskId = tb.TaskId,
                                       TaskCode = t != null ? t.TaskCode : null,
                                       TaskName = t != null ? t.TaskNameTh : null,
                                       Title = tb.Title,
                                       Description = tb.Description,
                                       Status = tb.Status,
                                       Priority = tb.Priority,
                                       AssigneeId = tb.AssigneeId,
                                       AssigneeName = e != null ? e.FirstNameEn + " " + e.LastNameEn : null,
                                       AssigneeImg = e != null ? e.ImgPath : null,
                                       DueDate = tb.DueDate,
                                       StartDate = tb.StartDate,
                                       ManDay = tb.ManDay,
                                       SprintName = tb.SprintName,
                                       SprintIsActive = tb.SprintIsActive,
                                       SortOrder = tb.SortOrder,
                                       ProjectName = p != null ? p.ProjectName : null,
                                   }).ToListAsync();

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "TaskBoard-GetByProject", "System");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        /// <summary>
        /// GET taskBoard — Get all tasks (all projects)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var tasks = await (from tb in _context.TaskBoards
                                   join e in _context.Employees on tb.AssigneeId equals e.Id into empJoin
                                   from e in empJoin.DefaultIfEmpty()
                                   join p in _context.Projects on tb.ProjectId equals p.ProjectId into projJoin
                                   from p in projJoin.DefaultIfEmpty()
                                   join t in _context.Tasks on tb.TaskId equals t.TaskId into taskJoin
                                   from t in taskJoin.DefaultIfEmpty()
                                   orderby tb.ProjectId, tb.Status, tb.SortOrder
                                   select new TaskBoardDto
                                   {
                                       TaskBoardId = tb.TaskBoardId,
                                       ProjectId = tb.ProjectId,
                                       TaskId = tb.TaskId,
                                       TaskCode = t != null ? t.TaskCode : null,
                                       TaskName = t != null ? t.TaskNameTh : null,
                                       Title = tb.Title,
                                       Description = tb.Description,
                                       Status = tb.Status,
                                       Priority = tb.Priority,
                                       AssigneeId = tb.AssigneeId,
                                       AssigneeName = e != null ? e.FirstNameEn + " " + e.LastNameEn : null,
                                       AssigneeImg = e != null ? e.ImgPath : null,
                                       DueDate = tb.DueDate,
                                       StartDate = tb.StartDate,
                                       ManDay = tb.ManDay,
                                       SprintName = tb.SprintName,
                                       SprintIsActive = tb.SprintIsActive,
                                       SortOrder = tb.SortOrder,
                                       ProjectName = p != null ? p.ProjectName : null,
                                   }).ToListAsync();

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "TaskBoard-GetAll", "System");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        /// <summary>
        /// GET taskBoard/sprints?projectId=1 — Get distinct sprints for a project (or all if no projectId)
        /// </summary>
        [HttpGet("sprints")]
        public async Task<ActionResult> GetSprints(int? projectId)
        {
            try
            {
                var query = _context.TaskBoards.AsQueryable();
                if (projectId.HasValue && projectId.Value > 0)
                    query = query.Where(t => t.ProjectId == projectId.Value);

                var sprints = await query
                    .Where(t => t.SprintName != null && t.SprintName != "")
                    .GroupBy(t => new { t.SprintName, t.SprintIsActive })
                    .Select(g => new
                    {
                        SprintName = g.Key.SprintName,
                        IsActive = g.Key.SprintIsActive ?? true,
                        TaskCount = g.Count(),
                    })
                    .OrderBy(s => s.SprintName)
                    .ToListAsync();

                return Ok(sprints);
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "TaskBoard-GetSprints", "System");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        /// <summary>
        /// PUT taskBoard/toggleSprint — Toggle sprint active/closed status
        /// </summary>
        [HttpPut("toggleSprint")]
        public async Task<ActionResult> ToggleSprint([FromBody] SprintToggleDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.SprintName))
                    return BadRequest(new { message = "Sprint name is required" });

                var query = _context.TaskBoards
                    .Where(t => t.SprintName == dto.SprintName);

                if (dto.ProjectId.HasValue && dto.ProjectId.Value > 0)
                    query = query.Where(t => t.ProjectId == dto.ProjectId.Value);

                var tasks = await query.ToListAsync();

                foreach (var task in tasks)
                {
                    task.SprintIsActive = dto.IsActive;
                    task.UpdateDate = DateTime.UtcNow;
                    task.UpdateBy = dto.Username;
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = $"Sprint '{dto.SprintName}' {(dto.IsActive ? "opened" : "closed")}", count = tasks.Count });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "TaskBoard-ToggleSprint", dto?.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        /// <summary>
        /// POST taskBoard/update — Create or update a task
        /// </summary>
        [HttpPost("update")]
        public async Task<ActionResult> CreateOrUpdate([FromBody] TaskBoardUpdateDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.Title))
                    return BadRequest(new { message = "Title is required" });

                var now = DateTime.UtcNow;

                if (dto.TaskBoardId > 0)
                {
                    // Update
                    var existing = await _context.TaskBoards.FindAsync(dto.TaskBoardId);
                    if (existing == null) return NotFound(new { message = "Task not found" });

                    existing.Title = dto.Title;
                    existing.Description = dto.Description;
                    existing.Status = dto.Status ?? existing.Status;
                    existing.Priority = dto.Priority ?? existing.Priority;
                    existing.AssigneeId = dto.AssigneeId;
                    existing.DueDate = dto.DueDate?.ToUniversalTime();
                    existing.StartDate = dto.StartDate?.ToUniversalTime();
                    existing.ManDay = dto.ManDay;
                    existing.SprintName = dto.SprintName;
                    existing.ProjectId = dto.ProjectId;
                    existing.TaskId = dto.TaskId;
                    existing.SortOrder = dto.SortOrder;
                    existing.UpdateDate = now;
                    existing.UpdateBy = dto.Username;

                    _context.TaskBoards.Update(existing);
                }
                else
                {
                    // Create
                    var maxId = await _context.TaskBoards.MaxAsync(t => (int?)t.TaskBoardId) ?? 0;
                    var maxSort = await _context.TaskBoards
                        .Where(t => t.ProjectId == dto.ProjectId && t.Status == (dto.Status ?? "pending"))
                        .MaxAsync(t => (int?)t.SortOrder) ?? 0;

                    var task = new TaskBoard
                    {
                        TaskBoardId = maxId + 1,
                        ProjectId = dto.ProjectId,
                        TaskId = dto.TaskId,
                        Title = dto.Title,
                        Description = dto.Description,
                        Status = dto.Status ?? "pending",
                        Priority = dto.Priority ?? "Medium",
                        AssigneeId = dto.AssigneeId,
                        DueDate = dto.DueDate?.ToUniversalTime(),
                        StartDate = dto.StartDate?.ToUniversalTime(),
                        ManDay = dto.ManDay,
                        SprintName = dto.SprintName,
                        SprintIsActive = true,
                        SortOrder = maxSort + 1,
                        CreateDate = now,
                        CreateBy = dto.Username,
                    };

                    _context.TaskBoards.Add(task);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Task saved successfully" });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "TaskBoard-CreateOrUpdate", dto?.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        /// <summary>
        /// PUT taskBoard/updateStatus — Drag & drop status change
        /// </summary>
        [HttpPut("updateStatus")]
        public async Task<ActionResult> UpdateStatus([FromBody] StatusUpdateDto dto)
        {
            try
            {
                var task = await _context.TaskBoards.FindAsync(dto.TaskBoardId);
                if (task == null) return NotFound(new { message = "Task not found" });

                task.Status = dto.Status;
                task.SortOrder = dto.SortOrder;
                task.UpdateDate = DateTime.UtcNow;
                task.UpdateBy = dto.Username;

                _context.TaskBoards.Update(task);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Status updated" });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "TaskBoard-UpdateStatus", dto?.Username);
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        /// <summary>
        /// DELETE taskBoard/delete?id=1 — Delete a task
        /// </summary>
        [HttpDelete("delete")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var task = await _context.TaskBoards.FindAsync(id);
                if (task == null) return NotFound(new { message = "Task not found" });

                _context.TaskBoards.Remove(task);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Task deleted successfully" });
            }
            catch (Exception ex)
            {
                _loggingService.LogError(ex.Message, ex.StackTrace, "TaskBoard-Delete", "System");
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }
    }
}

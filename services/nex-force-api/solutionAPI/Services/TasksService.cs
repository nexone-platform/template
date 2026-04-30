using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;

namespace solutionAPI.Services
{
    public class TasksService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        public TasksService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;
        }
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public class TaskUpdateDto
        {
            public int TaskId { get; set; }
            public string TaskNameTh { get; set; }
            public string? TaskNameEn { get; set; }
            public string TaskCode { get; set; }
            public bool IsActive { get; set; }
            public string? UpdateBy { get; set; }
            public string? Username { get; set; }
        }
        public async Task<string> CreateOrUpdateAsync(TaskUpdateDto taskUpdateDto)
        {
            var utcDateTime = DateTime.UtcNow;

            if (taskUpdateDto.TaskId > 0)
            {
                // Update existingTasks
                var existingTasks = await _context.Tasks
                    .FirstOrDefaultAsync(e => e.TaskId == taskUpdateDto.TaskId);

                if (existingTasks == null)
                {
                    throw new KeyNotFoundException($"Tasks with ID {taskUpdateDto.TaskId} not found.");
                }

                existingTasks.UpdateBy = taskUpdateDto.Username;
                existingTasks.UpdateDate = utcDateTime;
                existingTasks.CreateDate = existingTasks.CreateDate.Value.ToUniversalTime();
                existingTasks.TaskNameTh = taskUpdateDto.TaskNameTh;
                existingTasks.TaskNameEn = taskUpdateDto.TaskNameEn;
                existingTasks.TaskCode = taskUpdateDto.TaskCode;

                _context.Tasks.Update(existingTasks);
            }
            else
            {
                // Add new Tasks
                var newTasks = new Tasks
                {
                    TaskNameEn = taskUpdateDto.TaskNameEn,
                    TaskCode = taskUpdateDto.TaskCode,
                    TaskNameTh = taskUpdateDto.TaskNameTh,
                    CreateDate = utcDateTime,
                    CreateBy = taskUpdateDto.Username,
                    IsActive = true,
                };

                _context.Tasks.Add(newTasks);
            }

            await _context.SaveChangesAsync();
            return "Tasks saved successfully.";
        }
    }
}

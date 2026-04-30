
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;
using static solutionAPI.Controllers.ProjectsController;

namespace solutionAPI.Services
{
    public class ProjectService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;

        public ProjectService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor, ILoggingService loggingService)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _loggingService = loggingService;
        }
        public async Task SyncProjectAssignments(
            int projectId,
            List<ProjectAssignDto>? newAssignments,
            string username)
        {
            if (newAssignments == null)
                return;

            var utcNow = DateTime.UtcNow;

            // กัน duplicate
            var distinctAssignments = newAssignments
                .GroupBy(x => x.EmployeeId)
                .Select(g => g.First())
                .ToList();

            var existing = await _context.ProjectAssignments
                .Where(x => x.ProjectId == projectId)
                .ToListAsync();

            // ทำ lookup เร็วขึ้น
            var existingDict = existing.ToDictionary(x => x.EmployeeId);
            var newIds = distinctAssignments.Select(x => x.EmployeeId).ToHashSet();

            // ===== deactivate คนที่โดนลบ =====
            foreach (var old in existing)
            {
                if (!newIds.Contains(old.EmployeeId))
                {
                    old.IsActive = false;
                    old.UpdateBy = username;
                    old.UpdateDate = utcNow;
                }
            }

            // ===== add / update =====
            foreach (var item in distinctAssignments)
            {
                if (!existingDict.TryGetValue(item.EmployeeId, out var found))
                {
                    _context.ProjectAssignments.Add(new ProjectAssignment
                    {
                        ProjectId = projectId,
                        EmployeeId = item.EmployeeId,
                        RoleType = item.RoleType ?? "MEMBER",
                        IsActive = true,
                        AssignedDate = utcNow,
                        CreateBy = username,
                        CreateDate = utcNow
                    });
                }
                else
                {
                    found.RoleType = item.RoleType ?? "MEMBER";
                    found.IsActive = true;
                    found.UpdateBy = username;
                    found.UpdateDate = utcNow;
                }
            }
        }

        public async Task ValidateFilesAsync(
            List<IFormFile>? files,
            string category)
        {
            if (files == null || !files.Any())
                return;

            var maxImageMb = await GetIntAsync("MAX_IMAGE_SIZE_MB");
            var maxPdfMb = await GetIntAsync("MAX_PDF_SIZE_MB");

            foreach (var file in files)
            {
                var extension = Path.GetExtension(file.FileName).ToLower();
                var fileSizeMb = file.Length / (1024.0 * 1024.0);

                if (category == "IMAGE")
                {
                    if (!new[] { ".jpg", ".jpeg", ".png" }.Contains(extension))
                        throw new Exception($"{file.FileName} is not a valid image.");

                    if (fileSizeMb > maxImageMb)
                        throw new Exception($"{file.FileName} exceeds {maxImageMb} MB limit.");
                }

                if (category == "DOCUMENT")
                {
                    if (!new[] { ".pdf", ".doc", ".docx" }.Contains(extension))
                        throw new Exception($"{file.FileName} is not allowed document type.");

                    if (extension == ".pdf" && fileSizeMb > maxPdfMb)
                        throw new Exception($"{file.FileName} exceeds {maxPdfMb} MB limit.");
                }
            }
        }
        public async Task<int> GetIntAsync(string key)
        {
            var config = await _context.SystemConfigs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.ConfigKey == key && x.IsActive);

            if (config == null)
                throw new Exception($"Config '{key}' not found");

            return int.Parse(config.ConfigValue!);
        }

    }
}

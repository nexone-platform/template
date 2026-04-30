using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares.Models;
using solutionAPI.Services;
using System.Security.Claims;
using System.Text.Json;


namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProjectsController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public T? Data { get; set; }
            public int TotalData { get; set; }
        }

        public class ProjectDTO
        {
            public string? ProjectName { get; set; }
            public string? Description { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public string? Priority { get; set; }
            public int? ProjectLeader { get; set; }
            public string? Team { get; set; }
            public int? ProjectId { get; set; }
            public int? Id { get; set; }
            public int? Client { get; set; }
            public string? Rate { get; set; }
            public string? RateType { get; set; }
            public string? Username { get; set; }
            public decimal? ProjectTypeId { get; set; }
            public string? ProjectCode { get; set; }
            public string? InchargeName { get; set; }
            public string? Auditor { get; set; }
            public string? Approver { get; set; }
            public DateTime? IvDate { get; set; }
            public string? IvNo { get; set; }
            public int? TimesheetDateStart { get; set; }
            public string? PoNo { get; set; }
            public List<ProjectAssignDto>? Assignments { get; set; }
            public string? AssignmentsJson { get; set; }
            public string? DeletedImageIds { get; set; }
            public string? DeletedDocumentIds { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ProjectService _projectService;
        public ProjectsController(ApplicationDbContext context, IMapper mapper, ProjectService projectService)
        {
            _mapper = mapper;
            _context = context;
            _projectService = projectService;   
        }

        [HttpGet("getAllProject")]
        public IActionResult GetAllProjects()
        {
            var projects = _context.Projects
                .OrderBy(p => p.ProjectCode)
                .ToList();

            var projectIds = projects.Select(p => p.ProjectId).ToList();

            // 🔥 ดึง assignment ทั้งหมดครั้งเดียว
            var assignments = _context.ProjectAssignments
                .Where(a => projectIds.Contains(a.ProjectId) && a.IsActive == true)
                .ToList();

            var employeeIds = assignments.Select(a => a.EmployeeId).Distinct().ToList();

            // 🔥 ดึง employee ทั้งหมดครั้งเดียว
            var employees = (
                from e in _context.Employees
                join d in _context.Designations
                    on e.DesignationId equals d.DesignationId into dj
                from d in dj.DefaultIfEmpty()

                where employeeIds.Contains((int)e.Id)

                select new TeamMemberResponse
                {
                    EmployeeId = e.EmployeeId,
                    Id = e.Id,
                    FirstNameEn = e.FirstNameEn,
                    LastNameEn = e.LastNameEn,
                    ImgPath = !string.IsNullOrEmpty(e.ImgPath) ? e.ImgPath : null,

                    // 🔥 เพิ่ม designation
                    DesignationId = d != null ? d.DesignationId : 0,
                    DesignationCode = d != null ? d.DesignationCode : null,
                    DesignationName = d != null ? d.DesignationNameEn : null
                }
            ).ToList();

            var empDict = employees.ToDictionary(e => e.Id, e => e);

            var result = new List<ProjectResponse>();

            foreach (var p in projects)
            {
                var projectAssign = assignments
                    .Where(a => a.ProjectId == p.ProjectId)
                    .ToList();

                // 🔥 leader
                var leaderAssign = projectAssign
                    .FirstOrDefault(a => a.RoleType == "LEADER");

                TeamMemberResponse teamLead = new TeamMemberResponse();

                if (leaderAssign != null && empDict.ContainsKey(leaderAssign.EmployeeId))
                    teamLead = empDict[leaderAssign.EmployeeId];

                // 🔥 members
                var members = projectAssign
                    .Where(a => a.RoleType == "MEMBER")
                    .Select(a => empDict.ContainsKey(a.EmployeeId) ? empDict[a.EmployeeId] : null)
                    .Where(x => x != null)
                    .ToList();

                result.Add(new ProjectResponse
                {
                    Project = p.ProjectName,
                    ProjectId = p.ProjectId,
                    Deadline = p.EndDate,
                    Priority = p.Priority,
                    Description = p.Description,
                    Id = p.ProjectId,
                    TeamLead = teamLead,
                    Team = members!,
                    StartDate = p.StartDate,
                    IsActive = p.IsActive,
                    ProjectCode = p.ProjectCode,
                    InchargeName = p.InchargeName,
                    Auditor = p.Auditor,
                    Approver = p.Approver,
                    TimesheetDateStart = p.TimesheetDateStart,
                    PoNo = p.PoNo,
                    ProjectTypeId = p.ProjectTypeId,
                    Client = p.Client
                });
            }

            var response = new ApiResponse<List<ProjectResponse>>
            {
                Data = result,
                TotalData = result.Count
            };

            return Ok(response);
        }

        [HttpGet("getProjectsByClient/{clientId}")]
        public IActionResult GetProjectsByClient(int clientId)
        {
            var projects = _context.Projects
                .Where(p => p.Client == clientId)
                .OrderBy(p => p.ProjectCode)
                .ToList();

            var projectIds = projects.Select(p => p.ProjectId).ToList();

            // 🔥 ดึง assignment ทั้งหมดครั้งเดียว
            var assignments = _context.ProjectAssignments
                .Where(a => projectIds.Contains(a.ProjectId) && a.IsActive == true)
                .ToList();

            var employeeIds = assignments.Select(a => a.EmployeeId).Distinct().ToList();

            // 🔥 ดึง employee ครั้งเดียว
            var employees = _context.Employees
                .Where(e => employeeIds.Contains((int)e.Id))
                .Select(e => new TeamMemberResponse
                {
                    EmployeeId = e.EmployeeId,
                    Id = e.Id,
                    FirstNameEn = e.FirstNameEn,
                    LastNameEn = e.LastNameEn,
                    ImgPath = !string.IsNullOrEmpty(e.ImgPath) ? e.ImgPath : null
                })
                .ToList();

            var empDict = employees.ToDictionary(e => e.Id, e => e);

            var result = new List<ProjectResponse>();

            foreach (var p in projects)
            {
                var projectAssign = assignments.Where(a => a.ProjectId == p.ProjectId).ToList();

                // 🔥 leader
                var leaderAssign = projectAssign.FirstOrDefault(a => a.RoleType == "LEADER");
                TeamMemberResponse teamLead = new TeamMemberResponse();

                if (leaderAssign != null && empDict.ContainsKey(leaderAssign.EmployeeId))
                    teamLead = empDict[leaderAssign.EmployeeId];

                // 🔥 members
                var members = projectAssign
                    .Where(a => a.RoleType == "MEMBER")
                    .Select(a => empDict.ContainsKey(a.EmployeeId) ? empDict[a.EmployeeId] : null)
                    .Where(x => x != null)
                    .ToList();

                result.Add(new ProjectResponse
                {
                    Project = p.ProjectName,
                    ProjectId = p.ProjectId,
                    Deadline = p.EndDate,
                    Priority = p.Priority,
                    Description = p.Description,
                    Id = p.ProjectId,
                    TeamLead = teamLead,
                    Team = members!,
                    StartDate = p.StartDate,
                    IsActive = p.IsActive,
                    ProjectCode = p.ProjectCode,
                    InchargeName = p.InchargeName,
                    Auditor = p.Auditor,
                    Approver = p.Approver,
                    TimesheetDateStart = p.TimesheetDateStart,
                    PoNo = p.PoNo,
                    ProjectTypeId = p.ProjectTypeId
                });
            }

            return Ok(result);
        }

        public class ProjectSearchRequest
        {
            public string? EmployeeName { get; set; }
            public int? Designation { get; set; }
            public string? ProjectName { get; set; }
        }

        [HttpPost("searchProjects")]
        public IActionResult SearchProjects([FromBody] ProjectSearchRequest searchRequest)
        {
            // Step 1: Query the projects
            var projectDetails = _context.Projects
                .Select(p => new
                {
                    Project = p.ProjectName,
                    ProjectId = p.ProjectId,
                    Deadline = p.EndDate,
                    StartDate = p.StartDate,
                    Priority = p.Priority,
                    Description = p.Description,
                    Id = p.ProjectId,
                    TeamLeadId = p.ProjectLeader,
                    Active = p.IsActive,
                    Team = p.Team,
                    ProjectCode = p.ProjectCode,
                    InchargeName = p.InchargeName,
                    Auditor = p.Auditor,
                    Approver = p.Approver,
                    TimesheetDateStart = p.TimesheetDateStart,
                    PoNo = p.PoNo,
                    ProjectTypeId = p.ProjectTypeId
                }).OrderBy(c=>c.ProjectCode)
                .ToList();

            // Step 2: Filter Projects based on the search criteria
            if (!string.IsNullOrEmpty(searchRequest.ProjectName))
            {
                projectDetails = projectDetails.Where(p => p.Project.Contains(searchRequest.ProjectName, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            var projectResponses = new List<ProjectResponse>();

            foreach (var p in projectDetails)
            {
                // Get Team Lead
                var teamLead = _context.Employees
                    .Where(e => e.Id == p.TeamLeadId)
                    .Select(e => new TeamMemberResponse
                    {
                        EmployeeId = e.EmployeeId,
                        Id = e.Id,
                        FirstNameEn = e.FirstNameEn,
                        LastNameEn = e.LastNameEn,
                        ImgPath = !string.IsNullOrEmpty(e.ImgPath) ? e.ImgPath : null,
                    }).FirstOrDefault() ?? new TeamMemberResponse();

                // Get Team Members
                List<TeamMemberResponse> teamMembers = new List<TeamMemberResponse>();

                if (!string.IsNullOrEmpty(p.Team))
                {
                    var teamIds = p.Team.Split(',');

                    teamMembers = _context.Employees
                        .Where(e => teamIds.Contains(e.Id.ToString().Trim()))
                        .Select(e => new TeamMemberResponse
                        {
                            EmployeeId = e.EmployeeId,
                            Id = e.Id,
                            FirstNameEn = e.FirstNameEn,
                            LastNameEn = e.LastNameEn,
                            ImgPath = !string.IsNullOrEmpty(e.ImgPath) ? e.ImgPath : null,
                        }).ToList();
                }

                // Filter based on employeeName and designation
                if (!string.IsNullOrEmpty(searchRequest.EmployeeName) && !teamMembers.Any(tm => tm.FirstNameEn.Contains(searchRequest.EmployeeName, StringComparison.OrdinalIgnoreCase)))
                {
                    continue; // Skip if the employee name doesn't match
                }

                if (searchRequest.Designation.HasValue)
                {
                    if (!_context.Employees.Any(e => e.DesignationId == searchRequest.Designation))
                    {
                        continue; // Skip if the designation doesn't match
                    }
                }

                // Create ProjectResponse
                var projectResponse = new ProjectResponse
                {
                    Project = p.Project,
                    ProjectId = p.ProjectId,
                    Deadline = p.Deadline,
                    Priority = p.Priority,
                    Description = p.Description,
                    Id = p.Id,
                    TeamLead = teamLead,
                    Team = teamMembers,
                    StartDate =p.StartDate,
                    IsActive = p.Active,
                    ProjectCode = p.ProjectCode,
                    InchargeName = p.InchargeName,
                    Auditor = p.Auditor,
                    Approver = p.Approver,
                    TimesheetDateStart = p.TimesheetDateStart,
                    PoNo = p.PoNo,
                    ProjectTypeId = p.ProjectTypeId
                };

                // Add to the responses list
                projectResponses.Add(projectResponse);
            }

            var response = new ApiResponse<List<ProjectResponse>>
            {
                Data = projectResponses,
                TotalData = projectResponses.Count
            };

            return Ok(response);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteEmployee(decimal id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound(new { message = "Project not found" });
            }
            _context.Projects.Remove(project);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Project deleted successfully" });
        }

        public class ProjectAssignDto
        {
            public int EmployeeId { get; set; }
            public string RoleType { get; set; } = "MEMBER"; // LEADER | MEMBER
        }
        [HttpPost("update")]
        public async Task<ActionResult> CreateOrUpdateProject(
       [FromForm] ProjectDTO project,
       [FromForm] List<IFormFile>? images,
       [FromForm] List<IFormFile>? documents)
        {
            var utcDateTime = DateTime.UtcNow;

            if (project == null)
                return BadRequest(new { message = "Invalid project data." });

            if (!string.IsNullOrEmpty(project.AssignmentsJson))
            {
                project.Assignments = JsonSerializer.Deserialize<List<ProjectAssignDto>>(
                    project.AssignmentsJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );
            }
            if (project.Assignments == null)
            {
                throw new Exception("Assignments still NULL");
            }
            if (project.ProjectId > 0)
            {
                // ================= UPDATE =================
                var existingProject = await _context.Projects
                    .FirstOrDefaultAsync(e => e.ProjectId == project.ProjectId);

                if (existingProject == null)
                    return NotFound(new { message = $"Project {project.ProjectId} not found" });

                existingProject.UpdateBy = project.Username;
                existingProject.UpdateDate = utcDateTime;
                existingProject.ProjectName = project.ProjectName;
                existingProject.Team = project.Team;
                existingProject.Client = project.Client;
                existingProject.StartDate = project.StartDate;
                existingProject.EndDate = project.EndDate;
                existingProject.Rate = project.Rate;
                existingProject.RateType = project.RateType;
                existingProject.Priority = project.Priority;
                existingProject.ProjectLeader = project.ProjectLeader;
                existingProject.Description = project.Description;
                existingProject.ProjectTypeId = project.ProjectTypeId;
                existingProject.ProjectCode = project.ProjectCode;
                existingProject.InchargeName = project.InchargeName;
                existingProject.Approver = project.Approver;
                existingProject.Auditor = project.Auditor;
                existingProject.IvNo = project.IvNo;
                existingProject.IvDate = project.IvDate;
                existingProject.TimesheetDateStart = project.TimesheetDateStart;
                existingProject.PoNo = project.PoNo;

                // 🔥 sync assignment (update)
                await _projectService.SyncProjectAssignments(
                    existingProject.ProjectId,
                    project.Assignments,
                    project.Username
                );
                if (!string.IsNullOrEmpty(project.DeletedImageIds))
                {
                    var imageIds = JsonSerializer.Deserialize<List<int>>(project.DeletedImageIds);

                    var imagesToDelete = await _context.ProjectFiles
                        .Where(x =>
                            imageIds.Contains(x.FileId) &&
                            x.ProjectId == existingProject.ProjectId &&
                            x.FileCategory == "IMAGE")   // ⚠️ ใช้ FileCategory
                        .ToListAsync();

                    foreach (var file in imagesToDelete)
                    {
                        var physicalPath = Path.Combine(
                            Directory.GetCurrentDirectory(),
                            "wwwroot",
                            file.FilePath.TrimStart('/')
                        );

                        if (System.IO.File.Exists(physicalPath))
                            System.IO.File.Delete(physicalPath);
                    }

                    _context.ProjectFiles.RemoveRange(imagesToDelete);
                }
                if (!string.IsNullOrEmpty(project.DeletedDocumentIds))
                {
                    var docIds = JsonSerializer.Deserialize<List<int>>(project.DeletedDocumentIds);

                    var docsToDelete = await _context.ProjectFiles
                        .Where(x =>
                            docIds.Contains(x.FileId) &&
                            x.ProjectId == existingProject.ProjectId &&
                            x.FileCategory == "DOCUMENT")
                        .ToListAsync();

                    foreach (var file in docsToDelete)
                    {
                        var physicalPath = Path.Combine(
                            Directory.GetCurrentDirectory(),
                            "wwwroot",
                            file.FilePath.TrimStart('/')
                        );

                        if (System.IO.File.Exists(physicalPath))
                            System.IO.File.Delete(physicalPath);
                    }

                    _context.ProjectFiles.RemoveRange(docsToDelete);
                }
                // 🔥 upload files
                await UploadFiles(existingProject.ProjectId, images, "IMAGE", project.Username);
                await UploadFiles(existingProject.ProjectId, documents, "DOCUMENT", project.Username);

                _context.Projects.Update(existingProject);

            }
            else
            {
                // ================= CREATE =================
                var maxId = await _context.Projects.MaxAsync(e => (int?)e.ProjectId) ?? 0;
                maxId++;

                var newProject = new Project
                {
                    ProjectId = maxId,
                    ProjectName = project.ProjectName,
                    Client = project.Client,
                    StartDate = project.StartDate,
                    EndDate = project.EndDate,
                    Rate = project.Rate,
                    Team = project.Team,
                    RateType = project.RateType,
                    Priority = project.Priority,
                    ProjectLeader = project.ProjectLeader,
                    Description = project.Description,
                    ProjectTypeId = project.ProjectTypeId,
                    CreateDate = utcDateTime,
                    CreateBy = project.Username,
                    ProjectCode = project.ProjectCode,
                    InchargeName = project.InchargeName,
                    Auditor = project.Auditor,
                    Approver = project.Approver,
                    IvDate = project.IvDate,
                    IvNo = project.IvNo,
                    TimesheetDateStart = project.TimesheetDateStart,
                    PoNo = project.PoNo
                };

                _context.Projects.Add(newProject);

                // 🔥 sync assignment (create)
                await _projectService.SyncProjectAssignments(
                    newProject.ProjectId,
                    project.Assignments,
                    project.Username
                );
                // ================= DELETE FILES =================

                await _projectService.ValidateFilesAsync(images, "IMAGE");
                await _projectService.ValidateFilesAsync(documents, "DOCUMENT");
                await UploadFiles(newProject.ProjectId, images, "IMAGE", project.Username);
                await UploadFiles(newProject.ProjectId, documents, "DOCUMENT", project.Username);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Project saved successfully" });
        }

        [HttpGet("upload-config")]
        public async Task<IActionResult> GetUploadConfig()
        {
            var maxImageMb = await _projectService.GetIntAsync("MAX_IMAGE_SIZE_MB");
            var maxPdfMb = await _projectService.GetIntAsync("MAX_PDF_SIZE_MB");

            return Ok(new
            {
                maxImageMb,
                maxPdfMb
            });
        }


        private async Task UploadFiles(
              int projectId,
              List<IFormFile> files,
              string category,
              string username)
        {
            if (files == null || files.Count == 0) return;

            var isImage = category == "IMAGE";
            var folder = isImage ? "images" : "documents";

            // กำหนด root path ให้ตรงกับ nginx
            var baseFolder = isImage ? "images" : "uploads";

            var uploadRoot = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                baseFolder,
                "projects",
                projectId.ToString(),
                folder
            );

            if (!Directory.Exists(uploadRoot))
                Directory.CreateDirectory(uploadRoot);

            foreach (var file in files)
            {
                var ext = Path.GetExtension(file.FileName).ToLower();

                if (isImage && !new[] { ".jpg", ".jpeg", ".png" }.Contains(ext))
                    continue;

                if (!isImage && !new[] { ".pdf", ".doc", ".docx" }.Contains(ext))
                    continue;

                // สร้างชื่อไฟล์เดียว ใช้ทั้ง save และ DB
                var safeFileName = $"{Guid.NewGuid()}_{DateTime.UtcNow.Ticks}{ext}";
                var filePath = Path.Combine(uploadRoot, safeFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                _context.ProjectFiles.Add(new ProjectFile
                {
                    ProjectId = projectId,
                    FileCategory = category,
                    OriginalName = file.FileName,
                    StoredName = safeFileName,
                    FilePath = $"/{baseFolder}/projects/{projectId}/{folder}/{safeFileName}",
                    FileSize = file.Length,
                    FileType = file.ContentType,
                    CreateBy = username
                });
            }

            await _context.SaveChangesAsync();
        }
        public class ProjectFileDTO
        {
            public int FileId { get; set; }
            public string? FileCategory { get; set; } // IMAGE | DOCUMENT
            public string? OriginalName { get; set; }
            public string? StoredName { get; set; }
            public string? FilePath { get; set; }
        }
        public class ProjectResponseDTO
        {
            public int ProjectId { get; set; }
            public string? ProjectName { get; set; }
            public int? Client { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public string? Rate { get; set; }
            public string? RateType { get; set; }
            public string? Priority { get; set; }
            //public int? ProjectLeader { get; set; }
            public string? Description { get; set; }
            public bool? IsActive { get; set; }
            //public string? Team { get; set; }

            public DateTime? CreateDate { get; set; }
            public string? CreateBy { get; set; }
            public DateTime? UpdateDate { get; set; }
            public string? UpdateBy { get; set; }

            public decimal? ProjectTypeId { get; set; }
            public string? ProjectCode { get; set; }
            public string? InchargeName { get; set; }
            public string? Auditor { get; set; }
            public string? Approver { get; set; }

            public DateTime? IvDate { get; set; }
            public string? IvNo { get; set; }
            public string? PoNo { get; set; }
            public int? TimesheetDateStart { get; set; }
            public TeamMemberResponse? TeamLead { get; set; }
            public List<TeamMemberResponse> TeamMembers { get; set; } = new();
            // ⭐ files
            public List<ProjectFileDTO> Files { get; set; } = new();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectResponseDTO>> GetById(int id)
        {
            var project = await _context.Projects
                .Where(p => p.ProjectId == id)
                .Select(p => new ProjectResponseDTO
                {
                    ProjectId = p.ProjectId,
                    ProjectName = p.ProjectName,
                    Client = p.Client,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Rate = p.Rate,
                    RateType = p.RateType,
                    Priority = p.Priority,
                    Description = p.Description,
                    IsActive = p.IsActive,

                    CreateDate = p.CreateDate,
                    CreateBy = p.CreateBy,
                    UpdateDate = p.UpdateDate,
                    UpdateBy = p.UpdateBy,

                    ProjectTypeId = p.ProjectTypeId,
                    ProjectCode = p.ProjectCode,
                    InchargeName = p.InchargeName,
                    Auditor = p.Auditor,
                    Approver = p.Approver,
                    IvDate = p.IvDate,
                    IvNo = p.IvNo,
                    PoNo = p.PoNo,
                    TimesheetDateStart = p.TimesheetDateStart,

                    Files = _context.ProjectFiles
                        .Where(f => f.ProjectId == p.ProjectId)
                        .Select(f => new ProjectFileDTO
                        {
                            FileId = f.FileId,
                            FileCategory = f.FileCategory,
                            OriginalName = f.OriginalName,
                            StoredName = f.StoredName,
                            FilePath = f.FilePath
                        }).ToList()
                })
                .FirstOrDefaultAsync();

            if (project == null)
                return NotFound();

            // ⭐ TEAM LEADER
            project.TeamLead = await (
                from pa in _context.ProjectAssignments
                join e in _context.Employees on pa.EmployeeId equals e.Id
                where pa.ProjectId == id
                      && pa.RoleType == "LEADER"
                      && pa.IsActive == true
                select new TeamMemberResponse
                {
                    Id = e.Id,
                    EmployeeId = e.EmployeeId,
                    FirstNameEn = e.FirstNameEn,
                    LastNameEn = e.LastNameEn,
                    ImgPath = e.ImgPath
                }).FirstOrDefaultAsync();

            // ⭐ TEAM MEMBERS
            project.TeamMembers = await (
                from pa in _context.ProjectAssignments
                join e in _context.Employees on pa.EmployeeId equals e.Id
                where pa.ProjectId == id
                      && pa.IsActive == true
                      && pa.RoleType == "MEMBER"
                select new TeamMemberResponse
                {
                    Id = e.Id,
                    EmployeeId = e.EmployeeId,
                    FirstNameEn = e.FirstNameEn,
                    LastNameEn = e.LastNameEn,
                    ImgPath = e.ImgPath
                }).ToListAsync();

            return Ok(project);
        }

        public class ProjectView
        {
            public int ProjectId { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public DateTime? Deadline { get; set; }
            public string? Priority { get; set; }
            public bool? IsActive { get; set; }
            public string? Description { get; set; }
            public int Id { get; set; }
            public string? ProjectCode { get; set; }
            public string? InchargeName { get; set; }
            public string? Auditor { get; set; }
            public string? Approver { get; set; }
            public DateTime? IvDate { get; set; }
            public int? TimesheetDateStart { get; set; }
            public string? IvNo { get; set; }
            public string? PoNo { get; set; }
            public decimal? ProjectTypeId { get; set; }
            public TeamMemberResponse? TeamLead { get; set; }
            public List<TeamMemberResponse>? Team { get; set; }
            public string? ProjectName { get; set; }
            public List<ProjectFileDTO> Files { get; set; } = new();
            public List<ProjectFileDTO> ImageFiles { get; set; } = new();
            public DateTime? UpdateDate { get; set; }
            public string? UpdateBy { get; set; }

        }

        [HttpGet("getProjectById/{id}")]
        public async Task<ActionResult<ProjectResponseDTO>> GetProjectViewById(int id)
        {
            var p = _context.Projects
                     .Where(x => x.ProjectId == id)
                     .Select(x => new
                     {
                         ProjectName = x.ProjectName,
                         ProjectId = x.ProjectId,
                         Deadline = x.EndDate,
                         StartDate = x.StartDate,
                         Priority = x.Priority,
                         Description = x.Description,
                         Id = x.ProjectId,
                         TeamLeadId = x.ProjectLeader,
                         Active = x.IsActive,
                         ProjectTypeId = x.ProjectTypeId,
                         Team = x.Team,
                         ProjectCode = x.ProjectCode,
                         InchargeName = x.InchargeName,
                         Auditor = x.Auditor,
                         Approver = x.Approver,
                         TimesheetDateStart = x.TimesheetDateStart,
                         PoNo = x.PoNo,

                         UpdateDate = x.UpdateDate
                     })
                     .FirstOrDefault();

            if (p == null)
            {
                return NotFound(new { message = "Project not found" });
            }

            var teamLead = await (
                   from pa in _context.ProjectAssignments
                   join e in _context.Employees on pa.EmployeeId equals e.Id
                   where pa.ProjectId == id
                         && pa.RoleType == "LEADER"
                         && pa.IsActive == true
                   select new TeamMemberResponse
                   {
                       EmployeeId = e.EmployeeId,
                       Id = e.Id,
                       FirstNameEn = e.FirstNameEn,
                       LastNameEn = e.LastNameEn,
                       ImgPath = e.ImgPath
                   }
               ).FirstOrDefaultAsync() ?? new TeamMemberResponse();


            // ⭐ TEAM MEMBERS (จาก table ใหม่)
            var teamMembers = await (
                from pa in _context.ProjectAssignments
                join e in _context.Employees on pa.EmployeeId equals e.Id
                where pa.ProjectId == id
                      && pa.IsActive == true
                select new TeamMemberResponse
                {
                    EmployeeId = e.EmployeeId,
                    Id = e.Id,
                    FirstNameEn = e.FirstNameEn,
                    LastNameEn = e.LastNameEn,
                    ImgPath = e.ImgPath
                }
            ).ToListAsync();


            var filesImg = _context.ProjectFiles
                .Where(f => f.ProjectId == p.ProjectId && f.FileCategory == "IMAGE")
                .Select(f => new ProjectFileDTO
                {
                    FileId = f.FileId,
                    FileCategory = f.FileCategory,
                    OriginalName = f.OriginalName,
                    StoredName = f.StoredName,
                    FilePath = f.FilePath
                }).ToList();
            var filesDoc = _context.ProjectFiles
                    .Where(f => f.ProjectId == p.ProjectId && f.FileCategory == "DOCUMENT")
                    .Select(f => new ProjectFileDTO
                    {
                        FileId = f.FileId,
                        FileCategory = f.FileCategory,
                        OriginalName = f.OriginalName,
                        StoredName = f.StoredName,
                        FilePath = f.FilePath
                    }).ToList();


            var projectResponse = new ProjectView
            {
                ProjectName = p.ProjectName,
                ProjectId = p.ProjectId,
                EndDate = p.Deadline,
                Deadline = p.Deadline,
                Priority = p.Priority,
                Description = p.Description,
                Id = p.Id,
                TeamLead = teamLead,
                Team = teamMembers,
                StartDate = p.StartDate,
                IsActive = p.Active,
                ProjectCode = p.ProjectCode,
                InchargeName = p.InchargeName,
                Auditor = p.Auditor,
                Approver = p.Approver,
                TimesheetDateStart = p.TimesheetDateStart,
                PoNo = p.PoNo,
                ProjectTypeId = p.ProjectTypeId,
                ImageFiles= filesImg,
                Files = filesDoc,
                UpdateDate = p.UpdateDate
            };


            return Ok(projectResponse);
        }

        [HttpGet("getProjectType")]
        public async Task<ActionResult<IEnumerable<ApiResponse<IEnumerable<ProjectType>>>>> GetProjectType()
        {
            try
            {
                var projectTypes = await (from c in _context.ProjectTypes
                                          select new ProjectType
                                          {
                                              ProjectTypeCode = c.ProjectTypeCode,
                                              ProjectTypeId = c.ProjectTypeId,
                                              ProjectTypeNameEn = c.ProjectTypeNameEn,
                                              ProjectTypeNameTh = c.ProjectTypeNameTh,
                                              CreateDate = c.CreateDate,
                                              CreateBy = c.CreateBy,
                                              UpdateDate = c.UpdateDate,
                                              UpdateBy = c.UpdateBy
                                          }).ToListAsync();
                var response = new ApiResponse<IEnumerable<ProjectType>>
                {
                    Data = projectTypes,
                    TotalData = projectTypes.Count
                };

                return Ok(response);
     
            }
            catch (Exception ex)
            {
      
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpGet("getProject")]
        public async Task<ActionResult<IEnumerable<ApiResponse<IEnumerable<Project>>>>> GetProject()
        {
            try
            {
                var project = await (from c in _context.Projects
                                          select new Project
                                          {
                                              ProjectId = c.ProjectId,
                                              ProjectTypeId = c.ProjectTypeId,
                                              ProjectCode = c.ProjectCode,
                                              ProjectName = c.ProjectName,
                                              CreateDate = c.CreateDate,
                                              CreateBy = c.CreateBy,
                                              UpdateDate = c.UpdateDate,
                                              UpdateBy = c.UpdateBy
                                          }).ToListAsync();

                var response = new ApiResponse<IEnumerable<Project>>
                {
                    Data = project,
                    TotalData = project.Count
                };

                return Ok(response);

            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        [HttpGet("getProject/{leadId}")]
        public async Task<ActionResult<IEnumerable<ApiResponse<IEnumerable<Project>>>>> GetProjectByLeadId(int leadId)
        {
            try
            {
                var project = await (from c in _context.Projects
                                     where c.ProjectLeader == leadId
                                     select new Project
                                     {
                                         ProjectId = c.ProjectId,
                                         ProjectTypeId = c.ProjectTypeId,
                                         ProjectCode = c.ProjectCode,
                                         ProjectName = c.ProjectName,
                                         CreateDate = c.CreateDate,
                                         CreateBy = c.CreateBy,
                                         UpdateDate = c.UpdateDate,
                                         UpdateBy = c.UpdateBy
                                     }).ToListAsync();

                var response = new ApiResponse<IEnumerable<Project>>
                {
                    Data = project,
                    TotalData = project.Count
                };

                return Ok(response);

            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }

        public  class ProjectTypeDTO 
        {
            public string? username { get; set; }
            public int? ProjectTypeId { get; set; } // Using decimal to match PostgreSQL numeric type
            public string? ProjectTypeNameTh { get; set; }
            public string? ProjectTypeNameEn { get; set; }
            public string? ProjectTypeCode { get; set; }
        }

        [HttpPost("projectType/update")]
        public async Task<ActionResult<IEnumerable<ProjectType>>> CreateOrUpdateEmployee([FromBody] ProjectTypeDTO projectType)
        {
            var localDateTime = DateTime.Now; // Local time
            var utcDateTime = localDateTime.ToUniversalTime(); // Convert to UTC
            if (projectType == null)
            {
                return BadRequest(new { message = "Invalid projectType data." });
            }
            if (projectType.ProjectTypeId > 0)
            {  // Update existing 
                var existingProjectType = await _context.ProjectTypes
                    .FirstOrDefaultAsync(e => e.ProjectTypeId == projectType.ProjectTypeId);
                if (existingProjectType == null)
                {
                    return NotFound(new { message = $"ProjectType with ID {projectType.ProjectTypeId} not found." });
                }
                existingProjectType.UpdateBy = projectType.username;
                existingProjectType.UpdateDate = utcDateTime;
                existingProjectType.ProjectTypeNameTh = projectType.ProjectTypeNameTh;
                existingProjectType.ProjectTypeNameEn = projectType.ProjectTypeNameEn;
                existingProjectType.CreateDate = existingProjectType.CreateDate;
                existingProjectType.ProjectTypeCode = projectType.ProjectTypeCode;
                _context.ProjectTypes.Update(existingProjectType);
            }
            else
            {
                var maxId = await _context.ProjectTypes
                            .MaxAsync(e => (int?)e.ProjectTypeId);
                if (maxId == null)
                {
                    // Handle the case where the table is empty
                    maxId = 0;
                }
                else
                {
                    maxId = maxId + 1;
                }

                var newProjectType = new ProjectType
                {
                    ProjectTypeId = (int)maxId,
                    ProjectTypeNameEn = projectType.ProjectTypeNameEn,
                    ProjectTypeNameTh = projectType.ProjectTypeNameTh,
                    CreateDate = utcDateTime,
                    ProjectTypeCode = projectType.ProjectTypeCode,
                    CreateBy = projectType.username
                };

                _context.ProjectTypes.Add(newProjectType);
            }
            await _context.SaveChangesAsync();

            return Ok(new { message = "ProjectType save successfully" });
        }

        [HttpDelete("projectType/delete")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var projectType = await _context.ProjectTypes.FindAsync(id);
            if (projectType == null)
            {
                return NotFound(new { message = "Department not found" });
            }
            _context.ProjectTypes.Remove(projectType);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Department deleted successfully" });
        }

        public class TeamMemberResponse
        {
            public string? EmployeeId { get; set; }
            public decimal Id { get; set; }
            public string? FirstNameEn { get; set; }
            public string? LastNameEn { get; set; }
            public int? DesignationId { get; set; }
            public string? DesignationCode { get; set; }
            public string? DesignationName { get; set; }
            public string? ImgPath { get; set; }
        }

        public class ProjectResponse
        {
            public string? Project { get; set; }
            public int ProjectId { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? Deadline { get; set; }
            public string? Priority { get; set; }
            public bool? IsActive { get; set; }
            public string? Description { get; set; }
            public int Id { get; set; }
            public string? ProjectCode { get; set; }
            public string? InchargeName { get; set; }
            public string? Auditor { get; set; }
            public string? Approver { get; set; }
            public DateTime? IvDate { get; set; }
            public int? TimesheetDateStart { get; set; }
            public string? IvNo { get; set; }
            public string? PoNo { get; set; }
            public decimal? ProjectTypeId { get; set; }
            public TeamMemberResponse? TeamLead { get; set; }
            public List<TeamMemberResponse>? Team { get; set; }
            public int? Client { get; set; }
        }
        public class AssignDTO
        {
            public decimal Id { get; set; }

            public string? FirstNameEn { get; set; }
            public string? LastNameEn { get; set; }
            public string? FirstNameTh { get; set; }
            public string? LastNameTh { get; set; }

            public int? DepartmentId { get; set; }
            public string? DepartmentNameEn { get; set; }
            public string? DepartmentNameTh { get; set; }
            public int? DesignationId { get; set; }
            public string? DesignationNameEn { get; set; }
            public string? DesignationNameTh { get; set; }
            public string? ImgPath { get; set; }
        }

        [HttpGet("getEmployeeForAssign")]
        public async Task<ActionResult<IEnumerable<AssignDTO>>> GetEmployeesForAssign()
        {
            var employees = await (
                from e in _context.Employees.AsNoTracking()
                where e.IsActive == true && e.IsSuperadmin != true

                join d in _context.Departments.AsNoTracking()
                    on e.DepartmentId equals d.DepartmentId into deptJoin
                from d in deptJoin.DefaultIfEmpty()

                join des in _context.Designations.AsNoTracking()
                    on e.DesignationId equals des.DesignationId into desJoin
                from des in desJoin.DefaultIfEmpty()

                orderby e.FirstNameEn
                select new AssignDTO
                {
                    Id = e.Id,

                    FirstNameEn = e.FirstNameEn,
                    LastNameEn = e.LastNameEn,
                    FirstNameTh = e.FirstNameTh,
                    LastNameTh = e.LastNameTh,

                    DepartmentId = e.DepartmentId,
                    DepartmentNameEn = d != null ? d.DepartmentNameEn : null,
                    DepartmentNameTh = d != null ? d.DepartmentNameTh : null,

                    DesignationId = e.DesignationId,
                    DesignationNameEn = des != null ? des.DesignationNameEn : null,
                    DesignationNameTh = des != null ? des.DesignationNameTh : null,

                    ImgPath = e.ImgPath
                }
            ).ToListAsync();

            var response = new ApiResponse<List<AssignDTO>>
            {
                Data = employees,
                TotalData = employees.Count
            };

            return Ok(response);
        }

        [HttpDelete("deleteFile")]
        public async Task<IActionResult> deleteFile(int id)
        {
            var files = await _context.ProjectFiles.FindAsync(id);
            if (files == null)
            {
                return NotFound(new { message = "Files not found" });
            }
            _context.ProjectFiles.Remove(files);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Files deleted successfully" });
        }

        public class AssignUserRequest
        {
            public int ProjectId { get; set; }
            public int EmployeeId { get; set; }
            public string? RoleType { get; set; } = "MEMBER"; // optional
        }

        [HttpPost("assignUser")]
        public async Task<IActionResult> AssignUser([FromBody] AssignUserRequest dto)
        {
            if (dto.ProjectId <= 0 || dto.EmployeeId <= 0)
                return BadRequest(new { message = "Invalid data" });

            // 🔥 check already exists
            var existing = await _context.ProjectAssignments
                .FirstOrDefaultAsync(x =>
                    x.ProjectId == dto.ProjectId &&
                    x.EmployeeId == dto.EmployeeId);

            if (existing != null)
            {
                // ถ้าเคย assign แต่ inactive → เปิดกลับ
                if (existing.IsActive == false)
                {
                    existing.IsActive = true;
                    existing.UpdateDate = DateTime.Now;
                    existing.UpdateBy = User.Identity?.Name ?? "system";

                    await _context.SaveChangesAsync();

                    return Ok(new
                    {
                        success = true,
                        message = "Re-assigned successfully"
                    });
                }

                return Ok(new
                {
                    success = false,
                    message = "Employee already assigned"
                });
            }

            // 🔥 ถ้าเป็น leader → clear leader เก่า
            if (dto.RoleType == "LEADER")
            {
                var oldLeader = await _context.ProjectAssignments
                    .Where(x => x.ProjectId == dto.ProjectId
                             && x.RoleType == "LEADER"
                             && x.IsActive == true)
                    .ToListAsync();

                foreach (var l in oldLeader)
                {
                    l.RoleType = "MEMBER";
                    l.UpdateDate = DateTime.Now;
                }
            }

            // 🔥 insert ใหม่
            var assign = new ProjectAssignment
            {
                ProjectId = dto.ProjectId,
                EmployeeId = dto.EmployeeId,
                RoleType = dto.RoleType ?? "MEMBER",
                AssignedDate = DateTime.Now,
                CreateDate = DateTime.Now,
                CreateBy = User.Identity?.Name ?? "system",
                IsActive = true
            };

            _context.ProjectAssignments.Add(assign);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Assigned successfully"
            });
        }

        [HttpPost("removeUser")]
        public async Task<IActionResult> RemoveUser([FromBody] AssignUserRequest dto)
        {
            var data = await _context.ProjectAssignments
                .FirstOrDefaultAsync(x =>
                    x.ProjectId == dto.ProjectId &&
                    x.EmployeeId == dto.EmployeeId &&
                    x.IsActive == true);

            if (data == null)
                return NotFound();

            data.IsActive = false;
            data.UpdateDate = DateTime.Now;
            data.UpdateBy = User.Identity?.Name ?? "system";

            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }



    }
}

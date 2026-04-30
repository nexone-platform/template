using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Middleware.Data;
using Middlewares;
using Middlewares.Models;
using static solutionAPI.Controllers.ProjectCostController;

namespace solutionAPI.Services
{
    public class ProjectCostService
    {
        private readonly ILoggingService _loggingService;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public ProjectCostService(ApplicationDbContext context, IMapper mapper, ILoggingService loggingService)
        {
            _mapper = mapper;
            _loggingService = loggingService;
            _context = context;
        }

        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public class ProjectCostResponse
        {
            public int CostId { get; set; }
            public int? ProjectId { get; set; }
            public string? ProjectName { get; set; }

            public int? ClientId { get; set; }
            public string? ClientName { get; set; }
            public decimal? BudgetProject { get; set; }

            public decimal? TotalCost { get; set; }


            public decimal? MdPerMonth { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }

            public int TeamCount { get; set; }
            public DateTime? CreateDate { get; set; }
        }
        public async Task<ApiResponse<ProjectCostResponse>> GetAllAsync(ProjectCostSearchDto search)
        {
            var query = from cost in _context.ProjectCosts
                        join project in _context.Projects
                            on cost.ProjectId equals project.ProjectId into pj
                        from project in pj.DefaultIfEmpty()

                        join client in _context.Clients
                            on project.Client equals client.ClientId into cl
                        from client in cl.DefaultIfEmpty()

                        select new ProjectCostResponse
                        {
                            CostId = cost.CostId,
                            ProjectId = cost.ProjectId,
                            ProjectName = project.ProjectCode+ ": "+ project.ProjectName,

                            ClientId = project.Client,
                            ClientName = client.ClientCode +": "+ client.Company,
                            BudgetProject= cost.BudgetProject,
                            MdPerMonth = cost.MdPerMonth,
                            StartDate = project.StartDate,
                            EndDate = project.EndDate,

                            TotalCost = cost.TotalCost,
                            TeamCount = _context.ProjectCostDetails
                                .Count(d => d.CostId == cost.CostId),
                            CreateDate = cost.CreateDate
                        };

            // 🔎 dynamic filter
            if (search.ProjectId.HasValue && search.ProjectId > 0)
                query = query.Where(x => x.ProjectId == search.ProjectId);

            if (search.ClientId.HasValue && search.ClientId > 0)
                query = query.Where(x => x.ClientId == search.ClientId);

            if (search.StartDate.HasValue && search.EndDate.HasValue)
            {
                query = query.Where(x =>
                    x.StartDate <= search.EndDate &&
                    x.EndDate >= search.StartDate);
            }
            else if (search.StartDate.HasValue)
            {
                query = query.Where(x => x.EndDate >= search.StartDate);
            }
            else if (search.EndDate.HasValue)
            {
                query = query.Where(x => x.StartDate <= search.EndDate);
            }

            var total = await query.CountAsync();

            var data = await query
                .OrderByDescending(x => x.CreateDate)
                .ToListAsync();

            return new ApiResponse<ProjectCostResponse>
            {
                Data = data,
                TotalData = total
            };
        }

        public class ProjectCostCardResponse
        {
            public decimal? Cost { get; set; }
            public decimal? TotalHours { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
            public string? Priority { get; set; }
            public string? CreatedBy { get; set; }
        }

        public async Task<ProjectCostCardResponse?> GetProjectCostCardAsync(int projectId)
        {
            var data = await (
                from pc in _context.ProjectCosts
                join p in _context.Projects on pc.ProjectId equals p.ProjectId into pj
                from p in pj.DefaultIfEmpty()

                join emp in _context.Employees on p.CreateBy equals emp.EmployeeId into empj
                from emp in empj.DefaultIfEmpty()

                where pc.ProjectId == projectId

                select new ProjectCostCardResponse
                {
                    Cost = pc.TotalCost,
                    TotalHours = pc.MdPerMonth,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Priority = p.Priority,
                    CreatedBy = emp.FirstNameEn + " " + emp.LastNameEn
                }
            ).FirstOrDefaultAsync();

            return data;
        }

        // =====================================================
        // 🔥 GET ALL PROJECT COST
        // =====================================================
        public async Task<ApiResponse<object>> GetAllAsync()
        {
            var response = new ApiResponse<object>();

            try
            {
                var data = await (
                    from c in _context.ProjectCosts
                    join p in _context.Projects on c.ProjectId equals p.ProjectId
                    select new
                    {
                        c.CostId,
                        c.ProjectId,
                        ProjectName = p.ProjectName,
                        c.BudgetProject,
                        c.TotalCost,
                        c.MdPerMonth,

                        TeamCount = _context.ProjectCostDetails
                            .Count(d => d.CostId == c.CostId)
                    }
                )
                .OrderByDescending(x => x.CostId)
                .ToListAsync();

                response.Data = data.Cast<object>().ToList();
                response.TotalData = data.Count;
            }
            catch (Exception ex)
            {
                _loggingService.LogError(
                    ex.Message,
                    ex.InnerException?.Message ?? ex.Message,
                    "get-all-project-cost",
                   "system"
                );
                throw;
            }

            return response;
        }

        public class ProjectCostSaveDto
        {
            public int? CostId { get; set; }
            public int ProjectId { get; set; }
            public decimal? BudgetProject { get; set; }
            public decimal? TotalCost { get; set; }
            public decimal? MdPerMonth { get; set; }

            public int? ClientId { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }

            public string? Username { get; set; }

            public List<ProjectCostDetailDto>? CostDetail { get; set; }
        }

        public class ProjectCostDetailDto
        {
            public int? CostDetailId { get; set; }
            public int EmployeeId { get; set; }
            public string? EmployeeCode { get; set; }
            public string? EmployeeName { get; set; }
            public string? RoleName { get; set; }

            public decimal? CostPerDay { get; set; }
            public decimal? MdProject { get; set; }
            public decimal? TotalCost { get; set; }
            public decimal? MdUsed { get; set; }
            public decimal? RemainMd { get; set; }
            public decimal? ExtraCost { get; set; }
        }
        public async Task<bool> SaveProjectCostAsync(ProjectCostSaveDto dto, string username)
        {
            try
            {
                var utc = DateTime.UtcNow;

                ProjectCost header;

                // ===============================
                // UPDATE
                // ===============================
                if (dto.CostId.HasValue && dto.CostId > 0)
                {
                    header = await _context.ProjectCosts
                        .FirstOrDefaultAsync(x => x.CostId == dto.CostId);

                    if (header == null)
                        throw new Exception("Cost header not found");

                    header.BudgetProject = dto.BudgetProject ?? 0;
                    header.TotalCost = dto.TotalCost ?? 0;
                    header.MdPerMonth = dto.MdPerMonth ?? 0;
                    header.UpdateBy = username;
                    header.UpdateDate = utc;

                    _context.ProjectCosts.Update(header);
                }
                else
                {
                    var existProjectCost = await _context.ProjectCosts
                        .FirstOrDefaultAsync(x => x.ProjectId == dto.ProjectId);

                    if (existProjectCost != null)
                        throw new Exception("This project already has a cost record.");
                    header = new ProjectCost
                    {
                        ProjectId = dto.ProjectId,
                        BudgetProject = dto.BudgetProject ?? 0,
                        TotalCost = dto.TotalCost ?? 0,
                        MdPerMonth = dto.MdPerMonth ?? 0,
                        CreateBy = username,
                        CreateDate = utc
                    };

                    _context.ProjectCosts.Add(header);
                    await _context.SaveChangesAsync(); // get costId
                }

                // ===============================
                // SYNC DETAIL
                // ===============================
                if (dto.CostDetail != null)
                {
                    var existing = await _context.ProjectCostDetails
                        .Where(x => x.CostId == header.CostId)
                        .ToListAsync();

                    // ===== delete =====
                    foreach (var old in existing)
                    {
                        if (!dto.CostDetail.Any(x => x.CostDetailId == old.CostDetailId))
                        {
                            _context.ProjectCostDetails.Remove(old);
                        }
                    }

                    // ===== add/update =====
                    foreach (var item in dto.CostDetail)
                    {
                        var found = existing
                            .FirstOrDefault(x => x.CostDetailId == item.CostDetailId);

                        if (found == null || item.CostDetailId == 0)
                        {
                            // ADD
                            _context.ProjectCostDetails.Add(new ProjectCostDetail
                            {
                                CostId = header.CostId,
                                ProjectId = dto.ProjectId,
                                EmployeeId = item.EmployeeId,
                                RoleName = item.RoleName,
                                CostPerDay = item.CostPerDay ?? 0,
                                MdProject = item.MdProject ?? 0,
                                TotalCost = item.TotalCost ?? 0,
                                MdUsed = item.MdUsed ?? 0,
                                RemainMd = item.RemainMd ?? 0,
                                ExtraCost = item.ExtraCost ?? 0,
                                CreateBy = username,
                                CreateDate = utc
                            });
                        }
                        else
                        {
                            // UPDATE
                            found.RoleName = item.RoleName;
                            found.CostPerDay = item.CostPerDay ?? 0;
                            found.MdProject = item.MdProject ?? 0;
                            found.TotalCost = item.TotalCost ?? 0;
                            found.MdUsed = item.MdUsed ?? 0;
                            found.RemainMd = item.RemainMd ?? 0;
                            found.ExtraCost = item.ExtraCost ?? 0;
                            found.UpdateBy = username;
                            found.UpdateDate = utc;
                        }
                    }
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _loggingService.LogError(
                  ex.Message,
                  ex.InnerException?.Message ?? ex.Message,
                  "save-project-cost",
                  username
              );
                throw new Exception("Save cost error: " + ex.Message);
            }
        }
      


    }
}




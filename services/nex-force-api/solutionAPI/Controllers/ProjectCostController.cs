using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using solutionAPI.Services;
using static solutionAPI.Services.ProjectCostService;

namespace solutionAPI.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ProjectCostController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ProjectCostService _projectCostService;
        public ProjectCostController(ApplicationDbContext context, IMapper mapper, ProjectCostService projectCostService)
        {
            _mapper = mapper;
            _context = context;
            _projectCostService = projectCostService;
        }

        [HttpGet("{projectId}")]
        public async Task<IActionResult> GetByProjectId(int projectId)
        {
         
            var result = await _projectCostService.GetProjectCostCardAsync(projectId);

            if (result == null)
                return NotFound(new { message = "Project cost not found" });

            return Ok(result);
        }

        // =========================================
        // 🔥 GET ALL
        // =========================================
        public class ProjectCostSearchDto
        {
            public int? ProjectId { get; set; }
            public int? ClientId { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? EndDate { get; set; }
        }

        [HttpPost("get-all")]
        public async Task<IActionResult> GetAll([FromBody] ProjectCostSearchDto search)
        {
            var result = await _projectCostService.GetAllAsync(search);
            return Ok(result);
        }


        [HttpPost("update")]
        public async Task<IActionResult> Save(ProjectCostSaveDto dto)
        {
            var username = dto.Username
                           ?? User.Identity?.Name
                           ?? "system";

            await _projectCostService.SaveProjectCostAsync(dto, username);

            return Ok(new
            {
                success = true,
                message = "saved success"
            });
        }

        [HttpGet("getCost/{costId}")]
        public async Task<IActionResult> GetById(int costId)
        {
            var header = await (
                from c in _context.ProjectCosts
                join p in _context.Projects on c.ProjectId equals p.ProjectId into pj
                from p in pj.DefaultIfEmpty()

                where c.CostId == costId 

                select new
                {
                    costId = c.CostId,
                    projectId = c.ProjectId,
                    projectName = p.ProjectName,

                    budgetProject = c.BudgetProject,
                    totalCost = c.TotalCost,
                    mdPerMonth = c.MdPerMonth,
                    clientId = p.Client,
                    startDate = p.StartDate,
                    endDate = p.EndDate
                }
            ).FirstOrDefaultAsync();

            if (header == null)
                return NotFound();

            // 🔥 detail
            var detail = await (
                from d in _context.ProjectCostDetails
                join e in _context.Employees on d.EmployeeId equals e.Id into ej
                from e in ej.DefaultIfEmpty()
                join po in _context.Designations
                    on e.DesignationId equals po.DesignationId into posj
                from po in posj.DefaultIfEmpty()
                where d.CostId == costId

                select new
                {
                    costDetailId = d.CostDetailId,
                    employeeId = d.EmployeeId,
                    employeeCode = e.EmployeeId,
                    employeeName = e.FirstNameEn + " " + e.LastNameEn,
                    DesignationCode = po.DesignationCode,

                    costPerDay = d.CostPerDay,
                    mdProject = d.MdProject,
                    totalCost = d.TotalCost,

                    mdUsed = d.MdUsed,
                    remainMd = d.RemainMd,
                    extraCost = d.ExtraCost
                }
            ).ToListAsync();

            var result = new
            {
                costId = header.costId,
                projectId = header.projectId,
                projectName = header.projectName,

                budgetProject = header.budgetProject,
                totalCost = header.totalCost,
                mdPerMonth = header.mdPerMonth,
                clientId = header.clientId,
                startDate = header.startDate,
                endDate = header.endDate,

                costDetail = detail
            };

            return Ok(new
            {
                success = true,
                data = result
            });
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteCost(int id)
        {
            var cost = await _context.ProjectCosts.FindAsync(id);
            if (cost == null)
            {
                return NotFound(new { message = "Project cost not found" });
            }

            // 🔥 หา detail ทั้งหมด
            var costDetails = await _context.ProjectCostDetails
                .Where(x => x.CostId == id)
                .ToListAsync();

            // 🔥 ลบ detail ก่อน
            if (costDetails.Any())
                _context.ProjectCostDetails.RemoveRange(costDetails);

            // 🔥 ลบ cost
            _context.ProjectCosts.Remove(cost);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Project cost deleted successfully" });
        }

    }

}


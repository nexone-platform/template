using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;

namespace solutionAPI.Controllers
{
    /// <summary>
    /// Dedicated API for the Employee Dashboard page.
    /// Returns aggregated data in a single call to avoid multiple round-trips from the frontend.
    /// Does NOT modify any existing endpoints.
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class EmployeeDashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmployeeDashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ──────────────────────────────────────────────────────────────────
        // GET /EmployeeDashboard/{employeeId}?lang=en
        // Returns: employee profile, upcoming holidays (filtered by org),
        //          leave summary, and leave requests summary
        // ──────────────────────────────────────────────────────────────────
        [HttpGet("{employeeId}")]
        public async Task<IActionResult> GetDashboardData(decimal employeeId, [FromQuery] string lang = "en")
        {
            // ── 1. Employee profile ──
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
                return NotFound(new { message = $"Employee {employeeId} not found." });

            // Resolve organization code
            string? organizationCode = null;
            string? organizationName = null;

            if (employee.OrganizationId.HasValue)
            {
                var org = await _context.Organizations
                    .Where(o => o.OrganizationId == employee.OrganizationId.Value)
                    .Select(o => new { o.OrganizationCode, o.OrganizationNameEn, o.OrganizationNameTh })
                    .FirstOrDefaultAsync();

                if (org != null)
                {
                    organizationCode = org.OrganizationCode;
                    organizationName = lang == "th" ? org.OrganizationNameTh : org.OrganizationNameEn;
                }
            }
            else if (employee.ClientId.HasValue)
            {
                var client = await _context.Clients
                    .Where(c => c.ClientId == employee.ClientId.Value)
                    .Select(c => new { c.ClientCode, c.Company })
                    .FirstOrDefaultAsync();

                if (client != null)
                {
                    organizationCode = client.ClientCode;
                    organizationName = client.Company;
                }
            }

            // Resolve designation & department names
            var designation = employee.DesignationId.HasValue
                ? await _context.Designations
                    .Where(d => d.DesignationId == employee.DesignationId.Value)
                    .Select(d => lang == "th" ? d.DesignationNameTh : d.DesignationNameEn)
                    .FirstOrDefaultAsync()
                : null;

            var department = employee.DepartmentId.HasValue
                ? await _context.Departments
                    .Where(d => d.DepartmentId == employee.DepartmentId.Value)
                    .Select(d => lang == "th" ? d.DepartmentNameTh : d.DepartmentNameEn)
                    .FirstOrDefaultAsync()
                : null;

            var profile = new
            {
                employee.Id,
                employee.FirstNameEn,
                employee.LastNameEn,
                employee.FirstNameTh,
                employee.LastNameTh,
                employee.Email,
                employee.EmployeeId,
                employee.JoinDate,
                ImgPath = !string.IsNullOrEmpty(employee.ImgPath) ? employee.ImgPath : null,
                Department = department,
                Designation = designation,
                OrganizationCode = organizationCode,
                OrganizationName = organizationName,
            };

            // ── 2. Upcoming holidays filtered by employee's organization ──
            var today = DateTime.UtcNow.Date;
            var currentYear = DateTime.UtcNow.Year;

            var holidayQuery = _context.Holidays
                .Where(h => h.HolidayDate.Year == currentYear && h.HolidayDate >= today);

            if (!string.IsNullOrEmpty(organizationCode))
            {
                holidayQuery = holidayQuery.Where(h =>
                    h.OrganizationCode == organizationCode || h.OrganizationCode == null || h.OrganizationCode == "");
            }

            var holidays = await holidayQuery
                .OrderBy(h => h.HolidayDate)
                .Take(5)
                .Select(h => new
                {
                    h.HolidayId,
                    Title = lang == "th" && !string.IsNullOrEmpty(h.TitleTh) ? h.TitleTh : h.TitleEn,
                    h.HolidayDate,
                    h.Day,
                })
                .ToListAsync();

            // ── 3. Leave requests summary ──
            var leaveRequests = await _context.LeaveRequests
                .Where(lr => lr.EmployeeId == employeeId)
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    Total = g.Count(),
                    Pending = g.Count(lr => lr.Status == "New" || lr.Status == "Pending"),
                    Approved = g.Count(lr => lr.Status == "Approved"),
                    Rejected = g.Count(lr => lr.Status == "Rejected" || lr.Status == "Declined"),
                })
                .FirstOrDefaultAsync();

            var leaveRequestsSummary = leaveRequests ?? new { Total = 0, Pending = 0, Approved = 0, Rejected = 0 };

            // ── 4. Leave available quota (current year) ──
            // Calculate used days per leave type
            var usedDays = await _context.LeaveRequests
                .Where(lr => lr.EmployeeId == employeeId
                    && lr.StartDate.Year == currentYear
                    && (lr.Status == "Approved" || lr.Status == "New" || lr.Status == "Pending"))
                .GroupBy(lr => lr.LeaveTypeId)
                .Select(g => new { LeaveTypeId = g.Key, Used = g.Sum(lr => lr.TotalDays) })
                .ToListAsync();

            var usedDict = usedDays.ToDictionary(x => x.LeaveTypeId, x => x.Used);

            var leaveTypes = await (
                from lq in _context.LeaveQuotas
                join lt in _context.LeaveTypes on lq.LeaveTypeId equals lt.LeaveTypeId
                where lt.IsActive && lq.EmployeeId == employeeId && lq.Year == currentYear
                select new
                {
                    lt.LeaveTypeId,
                    LeaveTypeName = lang == "th" && !string.IsNullOrEmpty(lt.LeaveTypeNameTh) ? lt.LeaveTypeNameTh : lt.LeaveTypeNameEn,
                    TotalQuota = (double)lq.Quota,
                }
            ).ToListAsync();

            var leaveBalance = leaveTypes.Select(lt =>
            {
                var used = usedDict.ContainsKey(lt.LeaveTypeId) ? (double)usedDict[lt.LeaveTypeId] : 0;
                return new
                {
                    lt.LeaveTypeName,
                    lt.TotalQuota,
                    Used = used,
                    Available = lt.TotalQuota - used,
                };
            }).ToList();

            // ── Assemble response ──
            return Ok(new
            {
                Profile = profile,
                Holidays = holidays,
                LeaveRequests = leaveRequestsSummary,
                LeaveBalance = leaveBalance,
            });
        }
    }
}

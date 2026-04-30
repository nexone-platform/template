using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares.Models;
using System.Security.Claims;
using static solutionAPI.Controllers.HolidayController;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MaritalStatusController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public MaritalStatusController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }
        [HttpGet("getAllMaritalStatus")]
        public async Task<ActionResult<IEnumerable<MaritalStatus>>> GetMaritalStatus()
        {
            var maritalStatus = await _context.MaritalStatuss.ToListAsync();

            return Ok(maritalStatus);
        }

        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            return username?? "";
        }
    }
}

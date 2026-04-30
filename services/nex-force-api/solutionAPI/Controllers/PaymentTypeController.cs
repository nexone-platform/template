using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using Middlewares.Models;
using NuGet.ContentModel;
using System.Security.Claims;
using static solutionAPI.Controllers.AssetController;
using static solutionAPI.Controllers.HolidayController;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PaymentTypeController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public PaymentTypeController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }
         
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentType>>> GetGender()
        {
            var paymentTypes = await _context.PaymentTypes.ToListAsync();
            var response = new ApiResponse<PaymentType>
            {
                Data = paymentTypes,
                TotalData = paymentTypes.Count
            };
            return Ok(response);
        }
    }
}

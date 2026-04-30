using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middleware.Models;
using System.Linq;
using System.Security.Claims;
using static solutionAPI.Controllers.DesignationsController;

namespace solutionAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class NotificationController : ControllerBase
    {
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }

        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public NotificationController(ApplicationDbContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }
        [HttpGet("getAllNotiChanel")]
        public async Task<ActionResult<IEnumerable<NotificationChanel>>> GetAllNotiChanel()
        {
            var notiChanel = await _context.NotificationChanel.ToListAsync();
            var response = new ApiResponse<NotificationChanel>
            {
                Data = notiChanel,
                TotalData = notiChanel.Count
            };
            return Ok(response);
        }

        [HttpGet("getAllNotiModule")]
        public async Task<ActionResult<IEnumerable<NotificationModule>>> GetAllNotiModule()
        {
            var notiModule = await _context.NotificationModule.ToListAsync();
            var response = new ApiResponse<NotificationModule>
            {
                Data = notiModule,
                TotalData = notiModule.Count
            };
            return Ok(response);
        }

        [HttpGet("getAllNotiSetting")]
        public async Task<ActionResult<IEnumerable<NotificationSetting>>> GetAllNotiSetting()
        {
            var notiSetting = await _context.NotificationSetting.ToListAsync();
            var response = new ApiResponse<NotificationSetting>
            {
                Data = notiSetting,
                TotalData = notiSetting.Count
            };
            return Ok(response);
        }

        [HttpPost("addModule")]
        public async Task<ActionResult<IEnumerable<NotificationModule>>> CreateOrUpdateModle([FromBody] NotificationModule notificationModule)
        {

            if (notificationModule == null)
            {
                return BadRequest(new { message = "Invalid notification module data." });
            }
            if (notificationModule.ModuleId > 0)
            {  // Update existing 
                var existingModule = await _context.NotificationModule
                    .FirstOrDefaultAsync(e => e.ModuleId == notificationModule.ModuleId);
                if (existingModule == null)
                {
                    return NotFound(new { message = $"Modle with ID {notificationModule.ModuleId} not found." });
                }

                existingModule.UpdateBy = GetCurrentUserId();
                existingModule.UpdateDate = DateTime.UtcNow;
                existingModule.Module = notificationModule.Module;
                existingModule.Description = notificationModule.Description;
                existingModule.SeqShow = notificationModule.SeqShow;
                existingModule.CreateDate = existingModule.CreateDate;
                existingModule.CreateBy = existingModule.CreateBy;

                _context.NotificationModule.Update(existingModule);
            }
            else
            {
                var maxId = await _context.NotificationModule
                            .MaxAsync(e => (int?)e.ModuleId);
                if (maxId == null)
                {
                    // Handle the case where the table is empty
                    maxId = 1;
                }
                else
                {
                    maxId = maxId + 1;
                }

                var newModule = new NotificationModule
                {
                    ModuleId = (int)maxId,
                    Module = notificationModule.Module,
                    Description = notificationModule.Description,
                    SeqShow = notificationModule.SeqShow,
                    CreateDate = DateTime.UtcNow,
                    CreateBy = GetCurrentUserId()
                };

                _context.NotificationModule.Add(newModule);
            }
            await _context.SaveChangesAsync();

            return Ok(new { message = "Module save successfully" });
        }

        private string GetCurrentUserId()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            return username;
        }

    }
}

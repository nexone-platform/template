using authentication_server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using static authentication_server.Controllers.RegistationController;
using static authentication_server.Services.UserService;

namespace authentication_server.Controllers
{
    [ApiController]
    [Route("register")]
    public class RegistationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserService _userService;
        public RegistationController(ApplicationDbContext context, UserService userService)
        {
            _userService = userService;
            _context = context;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            try
            {
                var result = await _userService.Register(model);
                return Ok(new { message = "User registered successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        public class LoginModel
        {
            public string Email { get; set; }  // อีเมลของผู้ใช้
            public string Password { get; set; }  // รหัสผ่านของผู้ใช้
        }

/*        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel loginModel)
        {
            var isSuccess = await _userService.LoginAsync(loginModel);

            if (!isSuccess)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            return Ok("Login successful");
        }*/

    }
}

using authentication_server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Middleware.Data;
using Middleware.Models;
using Middlewares;
using Middlewares.Models;
using System.Text.Json;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using static Org.BouncyCastle.Math.EC.ECCurve;
using System.Net.Http.Headers;

namespace authentication_server.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TokenService _tokenService;
        private readonly UserService _userService;
        private readonly EmailService _emailService;
        private readonly ILoggingService _loggingService;
        private readonly IConfiguration _config;
        public AuthController(ApplicationDbContext context, TokenService tokenService, EmailService emailService, UserService userService, ILoggingService loggingService,IConfiguration config)
        {
            _tokenService = tokenService;
            _context = context;
            _emailService = emailService;
            _userService = userService;
            _loggingService = loggingService;
            _config = config;
        }

        //       [HttpPost("login")]
        //        public async Task<IActionResult> Login([FromBody] LoginModel loginRequest)
        //        {
        //            var employee = await _context.Users
        //                .SingleOrDefaultAsync(e => e.Email == loginRequest.Email);
        ///*            if (employee == null)
        //            {
        //                return Unauthorized(new { message = "Invalid username or password." });
        //            }*/
        //            // Hash the provided password with the stored salt
        ///*            var hashedPassword = _tokenService.HashPassword(loginRequest.Password, employee.Salt);

        //            // Compare the hashed password with the stored password
        //            if (hashedPassword != employee.Password)
        //            {
        //                return Unauthorized(new { message = "Invalid username or password." });
        //            }*/
        //           var emp  = await _context.Employees
        //               .SingleOrDefaultAsync(e => e.Email == loginRequest.Email);
        //            /*  if (emp != null) {
        //                 if (emp.ResignationDate < DateTime.UtcNow)
        //                 {
        //                     throw new Exception("This account is expire.");
        //                 }
        //             }*/
        //            var token = _tokenService.CreateToken(employee, emp.Id);
        //            // Create a response object containing both the token and employee data
        //            var response = new
        //            {
        //                Token = token,
        //                Employee = new
        //                {
        //                    employee.EmployeeId,
        //                    employee.Email,
        //                    // Include other employee properties as needed
        //                }
        //            };

        //            return Ok(response);
        //        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel loginRequest)
        {
            // ✅ Validate input
            if (string.IsNullOrWhiteSpace(loginRequest.Email) || string.IsNullOrWhiteSpace(loginRequest.Password))
            {
                return BadRequest(new { message = "Email and password are required." });
            }

            // ✅ Find user record
            var user = await _context.Users
                .SingleOrDefaultAsync(e => e.Email == loginRequest.Email && e.IsActive == true);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            // ✅ Verify password — superadmin ก็ต้องเช็ค password เหมือนกัน
            var hashedPassword = _tokenService.HashPassword(loginRequest.Password, user.Salt);
            if (hashedPassword != user.Password)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            // ✅ Find employee record (ใช้ IgnoreQueryFilters เพราะ superadmin ถูกกรองด้วย global filter)
            var emp = await _context.Employees
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(e => e.Email == loginRequest.Email);

            if (emp == null)
            {
                return Unauthorized(new { message = "Employee record not found." });
            }

            // ✅ Check if account is expired (resignation date)
            if (emp.ResignationDate.HasValue && emp.ResignationDate < DateTime.UtcNow)
            {
                return Unauthorized(new { message = "This account has expired." });
            }

            // ✅ Determine superadmin status
            bool isSuperadmin = emp.IsSuperadmin == true;

            var token = _tokenService.CreateToken(user, emp.Id, emp.RoleId, isSuperadmin);

            var response = new
            {
                Token = token,
                Employee = new
                {
                    user.EmployeeId,
                    user.Email,
                    IsSuperadmin = isSuperadmin
                }
            };

            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest registerDto)
        {
            // 1️⃣ ตรวจ employee
            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.EmployeeId == registerDto.EmployeeId && e.IsActive == true);

            if (employee == null)
                return BadRequest(new { message = "Employee ID not found." });

            // 2️⃣ เช็ค user ซ้ำ (employee)
            var existingUser = await _context.Users
                .AnyAsync(u => u.EmployeeId == registerDto.EmployeeId && u.IsActive == true);

            if (existingUser)
                return BadRequest(new { message = "An account with this Employee ID already exists." });

            // 3️⃣ เช็ค LINE token ซ้ำ (เฉพาะกรณีมาจาก LIFF)
            if (!string.IsNullOrWhiteSpace(registerDto.LineToken))
            {
                var lineExists = await _context.Users
                    .AnyAsync(u => u.LineToken == registerDto.LineToken);

                if (lineExists)
                    return BadRequest(new { message = "LINE account already regisimtered." });
            }

            // 4️⃣ ตรวจ password
            if (registerDto.Password != registerDto.ConfirmPassword)
                return BadRequest(new { message = "Password and Confirm Password do not match." });

            // 5️⃣ hash password
            var salt = _tokenService.GenerateSalt();
            var hashedPassword = _tokenService.HashPassword(registerDto.Password, salt);

            // 6️⃣ create user
            var newUser = new User
            {
                EmployeeId = registerDto.EmployeeId,
                Email = registerDto.Email,
                Password = hashedPassword,
                Salt = salt,
                LineToken = string.IsNullOrWhiteSpace(registerDto.LineToken)
                                ? null
                                : registerDto.LineToken,
                CreateDate = DateTime.UtcNow,
                CreateBy = registerDto.EmployeeId,
                RoleId = employee.RoleId,
                IsActive = true
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful." });
        }


        public class LineVerifyResponse
        {
            public string iss { get; set; }
            public string sub { get; set; }
            public string aud { get; set; }
            public long exp { get; set; }
            public long iat { get; set; }
            public string name { get; set; }
            public string picture { get; set; }
        }

        [HttpPost("register-line")]
        public async Task<IActionResult> RegisterLine(
              [FromBody] RegisterLineRequest dto,
              [FromServices] IHttpClientFactory httpClientFactory
          )
        {
            if (string.IsNullOrWhiteSpace(dto.EmployeeId) ||
                string.IsNullOrWhiteSpace(dto.Password) ||
                string.IsNullOrWhiteSpace(dto.LineToken))
            {
                return BadRequest(new { message = "Invalid request data." });
            }

            // ===== 1. Verify LINE ID Token =====
            var client = httpClientFactory.CreateClient();

            var verifyResponse = await client.PostAsync(
                "https://api.line.me/oauth2/v2.1/verify",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    { "id_token", dto.LineToken },
                    { "client_id", _config["LINE:ChannelId"] }
                })
            );

            if (!verifyResponse.IsSuccessStatusCode)
            {
                return Unauthorized(new
                {
                    code = "LINE_TOKEN_INVALID",
                    message = "LINE token is invalid or cannot be verified."
                });
            }

            var payload = JsonSerializer.Deserialize<LineVerifyResponse>(
                await verifyResponse.Content.ReadAsStringAsync()
            );

            // ===== 2. Validate payload =====
            if (payload.exp * 1000 < DateTimeOffset.UtcNow.ToUnixTimeMilliseconds())
                return Unauthorized(new
                {
                    code = "LINE_TOKEN_EXPIRED",
                    message = "LINE token has expired. Please login again."
                });


            // =====  user =====
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.EmployeeId == dto.EmployeeId);

            if (user == null)
                return BadRequest(new { message = "User not found." });

            // ===== 5. check LINE  =====
            var exists = await _context.Users.AnyAsync(u =>
                u.LineToken == payload.sub &&
                u.EmployeeId != dto.EmployeeId && u.IsActive == true
            );

            if (exists)
                return BadRequest(new { message = "LINE account already registered." });

            // ===== 6. bind LINE =====
            user.LineToken = payload.sub;

            user.UpdateDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await LinkRichMenuToUser(payload.sub, httpClientFactory);

            var emp = await _context.Employees
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(e => e.Email == user.Email);

            bool isSuperadmin = emp?.IsSuperadmin == true;
            var token = _tokenService.CreateToken(user, emp.Id, emp?.RoleId, isSuperadmin);

       
            var response = new
            {
                Token = token,
                Employee = new
                {
                    user.EmployeeId,
                    user.Email
                }
            };

            return Ok(response);
        }

        [HttpPost("login-by-line")]
        public async Task<IActionResult> LoginByLine(
              [FromBody] LoginByLineRequest dto,
              [FromServices] IHttpClientFactory httpClientFactory
          )
        {
            if (string.IsNullOrWhiteSpace(dto.LineToken))
            {
                return BadRequest(new { message = "LINE token is required." });
            }

            // ===== 1. Verify LINE ID Token =====
            var client = httpClientFactory.CreateClient();

            var verifyResponse = await client.PostAsync(
                "https://api.line.me/oauth2/v2.1/verify",
                new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    { "id_token", dto.LineToken },
                    { "client_id", _config["LINE:ChannelId"] }
                })
            );

            if (!verifyResponse.IsSuccessStatusCode)
            {
                return Unauthorized(new
                {
                    code = "LINE_TOKEN_INVALID",
                    message = "LINE token is invalid or cannot be verified."
                });
            }

            var payload = JsonSerializer.Deserialize<LineVerifyResponse>(
                await verifyResponse.Content.ReadAsStringAsync()
            );

            // ===== 2. Validate expiry =====
            if (payload.exp * 1000 < DateTimeOffset.UtcNow.ToUnixTimeMilliseconds())
                return Unauthorized(new
                {
                    code = "LINE_TOKEN_EXPIRED",
                    message = "LINE token has expired. Please login again."
                });

            // ===== 3. Find user by LINE sub =====
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.LineToken == payload.sub && u.IsActive == true);

            if (user == null)
            {
                return NotFound(new
                {
                    code = "LINE_NOT_REGISTERED",
                    message = "This LINE account is not registered."
                });
            }

            // ===== 4. Generate JWT =====
            var emp = await _context.Employees
                .IgnoreQueryFilters()
                .SingleOrDefaultAsync(e => e.Email == user.Email);

            if (emp == null)
            {
                return BadRequest(new { message = "Employee record not found." });
            }

            // Check if account is expired
            if (emp.ResignationDate.HasValue && emp.ResignationDate < DateTime.UtcNow)
            {
                return Unauthorized(new { message = "This account has expired." });
            }

            bool isSuperadmin = emp.IsSuperadmin == true;
            var token = _tokenService.CreateToken(user, emp.Id, emp.RoleId, isSuperadmin);

            var response = new
            {
                Token = token,
                Employee = new
                {
                    user.EmployeeId,
                    user.Email
                }
            };

            return Ok(response);
        }

        private async Task LinkRichMenuToUser(string lineUserId, IHttpClientFactory httpClientFactory)
        {
            try
            {
                var richMenuId = _config["LINE:richMenuAfterLogged"];
                var accessToken = _config["LINE:MessagingAccessToken"];

                var client = httpClientFactory.CreateClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                var url = $"https://api.line.me/v2/bot/user/{lineUserId}/richmenu/{richMenuId}";
                var response = await client.PostAsync(url, null);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[LINE API Error] Link Rich Menu: {error}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[System Error] Rich Menu Linking failed: {ex.Message}");
            }
        }

        [HttpGet("check-line-token/{lineToken}")]
        public async Task<IActionResult> CheckLineToken(string lineToken)
        {
            if (string.IsNullOrWhiteSpace(lineToken))
            {
                return Ok(new { exists = false });
            }

            var exists = await _context.Users
                         .AnyAsync(u =>
                             u.LineToken == lineToken &&
                             u.IsActive == true
                         );

            return Ok(new { exists });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            // Find the user by email
            var users = await _context.Users.FirstOrDefaultAsync(e => e.Email == request.Email && e.IsActive == true);
            if (users == null)
            {
                return BadRequest(new { message = "Email not found." });
            }

            // Generate 6-character OTP
            var otp = GenerateOTP(6);

            // Create OTP record
            var otpRecord = new EmployeeOtp
            {
                Otp = otp,
                EmployeeId = users.EmployeeId.ToString(),
                Email = users.Email,
                Expiry = DateTime.UtcNow.AddMinutes(10), // 10-minute expiry
                CreateDate = DateTime.UtcNow,
                CreateBy = "System" // Or any identifier for the source
            };
            _context.EmployeeOtps.Add(otpRecord);
            await _context.SaveChangesAsync();

            // Send OTP to the user's email
            var values = new Dictionary<string, string>
                {
                    { "OTP", otp }
                };

            var languageCode = "en";

            var (subject, message) = await _emailService.GetTemplateWithContentAsync("OTP_EMAIL", values, languageCode);

            if (!string.IsNullOrWhiteSpace(users.Email) &&
                !string.IsNullOrWhiteSpace(subject) &&
                !string.IsNullOrWhiteSpace(message))
            {
                await _emailService.SendEmailBySettingAsync(users.Email, subject, message);
            }
            else if (users.Email == null) {
            
                return BadRequest(new { message = "Email not found." });
            }

            return Ok(new { message = "OTP has been sent to your email." });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOTP([FromBody] VerifyOtpRequest request)
        {
            var otpRecord = await _context.EmployeeOtps
                            .FirstOrDefaultAsync(o => o.Email == request.Email && o.Otp == request.Otp);

            if (otpRecord == null || otpRecord.Expiry < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Invalid or expired OTP." });
            }

            // OTP is valid; allow password reset
            return Ok(new { message = "OTP is valid. You can now reset your password." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            // Verify the OTP
            var otpRecord = await _context.EmployeeOtps
                .FirstOrDefaultAsync(o => o.Email == request.Email && o.Otp == request.Otp);

            if (otpRecord == null || otpRecord.Expiry < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Invalid or expired OTP." });
            }
            var user = await _context.Users.FirstOrDefaultAsync(e => e.Email == request.Email && e.IsActive == true);


            if (user == null)
            {
                return BadRequest(new { message = "Invalid email." });
            }



            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            // Generate a new salt and hash the new password
            var salt = _tokenService.GenerateSalt(32);

            user.UpdateDate = DateTime.UtcNow;
            user.CreateDate = user.CreateDate;
            user.CreateBy = user.CreateBy;
            user.Email = user.Email;
            user.UpdateBy = username;
            user.Password = _tokenService.HashPassword(request.NewPassword, salt);
       


            // Remove OTP record
            _context.EmployeeOtps.Remove(otpRecord);
            _context.Users.Update(user);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully." });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            // Find the employee by email
   
            var user = await _context.Users.FirstOrDefaultAsync(e => e.Email == request.Email);
            if (user == null)
            {
                return BadRequest(new { message = "Email not found." });
            }

            // Hash the provided old password with the stored salt
            var hashedOldPassword = _tokenService.HashPassword(request.OldPassword, user.Salt);

            // Compare the hashed old password with the stored password
            if (hashedOldPassword != user.Password)
            {
                return BadRequest(new { message = "Old password is incorrect." });
            }

            // Ensure the new password is not the same as the old password
            var hashedNewPassword = _tokenService.HashPassword(request.NewPassword, user.Salt);
            if (hashedNewPassword == user.Password)
            {
                return BadRequest(new { message = "New password cannot be the same as the old password." });
            }
            var newSalt = _tokenService.GenerateSalt();
            user.Salt = newSalt;
            user.Password = _tokenService.HashPassword(request.NewPassword, newSalt);

            // Update user metadata
            user.UpdateDate = DateTime.UtcNow;
            user.UpdateBy = user.EmployeeId;
            user.CreateDate = user.CreateDate?.ToUniversalTime();
            _context.Users.Update(user);

            await _context.SaveChangesAsync();


            return Ok(new { message = "Password changed successfully." });
        }

        public class UserProfileDto
        {
            public string FullName { get; set; }
            public string EmployeeId { get; set; }
            public string ProfileImage { get; set; }
            public string? Organization { get; set; }
            public int? OrganizationId { get; set; }
            public int? ClientId { get; set; }
            public string? Client { get; set; }
            public string? OrganizationCode { get; set; }
        }

        [HttpGet("profile/{id}")]
        public async Task<ActionResult<UserProfileDto>> GetUserProfileAsync(string id)
        {
            try
            {
                var userProfile = await (
                    from u in _context.Users
                    join e in _context.Employees.IgnoreQueryFilters()
                        on u.EmployeeId equals e.EmployeeId

                    join o in _context.Organizations
                        on e.OrganizationId equals o.OrganizationId into orgJoin
                    from org in orgJoin.DefaultIfEmpty()

                    join c in _context.Clients
                        on e.ClientId equals c.ClientId into clientJoin
                    from client in clientJoin.DefaultIfEmpty()

                    where u.EmployeeId == id
                    select new UserProfileDto
                    {
                        FullName = e.FirstNameEn + " " + e.LastNameEn,
                        EmployeeId = e.EmployeeId,
                        ProfileImage = e.ImgPath,

                        // Organization
                        Organization = org != null ? org.OrganizationNameEn : null,
                        OrganizationId = org != null ? org.OrganizationId : null,

                        // Client
                        ClientId = client != null ? client.ClientId : null,
                        Client = client != null ? client.Company : null,
                        OrganizationCode = org != null
                                            ? org.OrganizationCode
                                            : client.ClientCode
                    }
                ).FirstOrDefaultAsync();

                if (userProfile == null)
                    return NotFound(new { message = "User profile not found" });

                return Ok(userProfile);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred. Please try again later." });
            }
        }


        /*        [HttpPost("login")]
                public async Task<IActionResult> Login([FromBody] LoginModel loginModel)
                {
                    var user = await _userService.LoginData(loginModel);

                    // If authentication fails, return Unauthorized
                    if (user == null)
                    {
                        return Unauthorized(new { message = "Invalid email or password." });
                    }

                    // After successful authentication, get the employee data using emp_id from the user
                    var employee = await _context.Employees.SingleOrDefaultAsync(e => e.EmployeeId == user.EmployeeId);

                    if (employee == null)
                    {
                        return NotFound(new { message = "Employee record not found." });
                    }

                    if (!employee.IsActive)
                    {
                        return Unauthorized(new { message = "Inactive account." });
                    }

                    // Generate a token for the authenticated user
                    var token = _tokenService.CreateToken(employee);

                    // Create a response object containing both the token and employee data
                    var response = new
                    {
                        Token = token,
                        Employee = new
                        {
                            employee.Id,
                            employee.FirstNameTh,
                            employee.LastNameTh,
                            employee.Email,
                            // Include other employee properties as needed
                        }
                    };

                    return Ok(response);
                }
        */
        // OTP Generator Function
        private string GenerateOTP(int length)
        {
            var random = new Random();
            return new string(Enumerable.Range(0, length).Select(x => (char)('0' + random.Next(0, 10))).ToArray());
        }
    }

}
public class LoginModel
{
    public string Email { get; set; }  // อีเมลของผู้ใช้
    public string Password { get; set; }  // รหัสผ่านของผู้ใช้
}

public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
}
public class RegisterLineRequest
{
    public string EmployeeId { get; set; }

    public string Password { get; set; }
    public string? LineToken { get; set; }
}
public class RegisterRequest
{
    public string EmployeeId { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string ConfirmPassword { get; set; }

    public string? LineToken { get; set; }
}
public class ForgotPasswordRequest
{
    public string Email { get; set; }
}

public class VerifyOtpRequest
{
    public string Email { get; set; }
    public string Otp { get; set; }
}

public class ResetPasswordRequest
{
    public string Email { get; set; }
    public string Otp { get; set; }
    public string NewPassword { get; set; }
}
public class ChangePasswordRequest
{
    public string Email { get; set; }
    public string OldPassword { get; set; }
    public string NewPassword { get; set; }
}

public class LoginByLineRequest
{
    public string LineToken { get; set; }
}
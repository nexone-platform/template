using Middleware.Data;
using Middlewares.Models;
using Microsoft.EntityFrameworkCore;
using static authentication_server.Controllers.RegistationController;
using Microsoft.AspNetCore.Identity.Data;
using Middleware.Models;
using Middlewares;
namespace authentication_server.Services
{
    public class UserService
    {
        private readonly TokenService _tokenService;
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;
        private readonly IConfiguration _configuration;
        public UserService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor, IConfiguration configuration, TokenService tokenService)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
            _tokenService = tokenService;
        }

        public class RegisterModel
        {
            public string EmployeeId { get; set; }  // Employee ID
            public string Mobile { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
        }

        public async Task<bool> Register(RegisterModel model)
        {
            // 1. Validate if the employee exists in the employees table
  /*          var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeId == model.EmployeeId);
            if (employee == null)
            {
                throw new Exception("Employee ID not found.");
            }

            // 2. Compare the provided password with the one in the employees table
            if (!VerifyPassword(model.Password, employee.Salt, employee.Password))
            {
                throw new Exception("Password does not match the one on record.");
            }

            // 3. Check if the employee ID is already registered in tb_user
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.EmployeeId == model.EmployeeId);
            if (existingUser != null)
            {
                throw new Exception("Employee is already registered.");
            }
            var salt = _tokenService.GenerateSalt();
            var hashedPassword = _tokenService.HashPassword(model.Password, salt);
            // 4. Store the same password in the tb_user table
            var newUser = new User
            {
                EmployeeId = model.EmployeeId,
                Email = model.Email,
                Mobile = model.Mobile,
                Password = hashedPassword,  // Use the same hashed password as in employees table
                CreateDate = DateTime.UtcNow
            };

            _context.Users.Add(newUser);

*//*            // 5. Update the line_token in employees table if provided
            if (!string.IsNullOrEmpty(model.LineToken))
            {
                employee.LineToken = model.LineToken;
                _context.Employees.Update(employee);
            }*//*

            // 6. Save all changes
            await _context.SaveChangesAsync();*//*          var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeId == model.EmployeeId);
            if (employee == null)
            {
                throw new Exception("Employee ID not found.");
            }

            // 2. Compare the provided password with the one in the employees table
            if (!VerifyPassword(model.Password, employee.Salt, employee.Password))
            {
                throw new Exception("Password does not match the one on record.");
            }

            // 3. Check if the employee ID is already registered in tb_user
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.EmployeeId == model.EmployeeId);
            if (existingUser != null)
            {
                throw new Exception("Employee is already registered.");
            }
            var salt = _tokenService.GenerateSalt();
            var hashedPassword = _tokenService.HashPassword(model.Password, salt);
            // 4. Store the same password in the tb_user table
            var newUser = new User
            {
                EmployeeId = model.EmployeeId,
                Email = model.Email,
                Mobile = model.Mobile,
                Password = hashedPassword,  // Use the same hashed password as in employees table
                CreateDate = DateTime.UtcNow
            };

            _context.Users.Add(newUser);

*//*            // 5. Update the line_token in employees table if provided
            if (!string.IsNullOrEmpty(model.LineToken))
            {
                employee.LineToken = model.LineToken;
                _context.Employees.Update(employee);
            }*//*

            // 6. Save all changes
            await _context.SaveChangesAsync();*/

            return true;
        }

        public async Task<bool> LoginAsync(LoginModel loginModel)
        {
            // ค้นหาผู้ใช้ในฐานข้อมูลโดยใช้อีเมล
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginModel.Email);

            if (user == null)
            {
                return false; // ผู้ใช้ไม่พบ
            }

            // ตรวจสอบว่ารหัสผ่านที่ป้อนมาตรงกับรหัสผ่านที่เก็บไว้หรือไม่
            if (!VerifyPassword(loginModel.Password, user.Password, user.Salt))
            {
                return false; // รหัสผ่านไม่ถูกต้อง
            }

            return true; // ล็อกอินสำเร็จ
        }

        public async Task<User?> LoginData(LoginModel loginRequest)
        {
            // Search for the employee using email
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Email == loginRequest.Email);

            if (user == null)
            {
                return null; // User not found
            }

            // Hash the provided password with the stored salt
            var hashedPassword = _tokenService.HashPassword(loginRequest.Password, user.Salt);

            // Check if the hashed password matches the stored password
            if (hashedPassword != user.Password)
            {
                return null; // Password does not match
            }

            return user; // Return the authenticated user
        }

        public bool VerifyPassword(string inputPassword, string storedSalt, string storedHashedPassword)
        {
            // Hash the input password with the stored salt
            string hashedInputPassword = _tokenService.HashPassword(inputPassword, storedSalt);

            // Compare the hashed input password with the stored hashed password
            return hashedInputPassword == storedHashedPassword;
        }

        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public class UserDTO
        {
            public int UserId { get; set; }
            public int? EmployeeId { get; set; }
            public string? Email { get; set; }
            public string? Password { get; set; }
            public int? RoleId { get; set; }
            public string? FirstName { get; set; }
            public string? LastName { get; set; }
            public string? Username { get; set; }
            public bool? IsActive { get; set; }
        }

        public async Task<User> AddOrUpdateUser(UserDTO userDto)
        {
            if (userDto == null)
                throw new ArgumentNullException(nameof(userDto));

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                string salt = _tokenService.GenerateSalt();
                var hashedPassword = string.Empty;

                if (!string.IsNullOrEmpty(userDto.Password))
                {
                    hashedPassword = _tokenService.HashPassword(userDto.Password, salt);
                }

                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Id == userDto.EmployeeId);

                if (employee == null)
                    throw new KeyNotFoundException("Employee not found.");

                // ตรวจสอบ EmployeeId ซ้ำ
                var existingUserByEmpId = await _context.Users
                    .FirstOrDefaultAsync(u => u.EmployeeId == employee.EmployeeId
                                           && u.UserId != userDto.UserId);

                if (existingUserByEmpId != null)
                    throw new InvalidOperationException("Employee ID already exists.");

                // ตรวจสอบ Email ซ้ำ
                var existingUserByEmail = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == userDto.Email
                                           && u.UserId != userDto.UserId);

                if (existingUserByEmail != null)
                    throw new InvalidOperationException("Email already exists.");

                User user;

                if (userDto.UserId == 0)
                {
                    // ===== INSERT USER =====
                    user = new User
                    {
                        EmployeeId = employee.EmployeeId,
                        Email = userDto.Email,
                        Password = hashedPassword,
                        Salt = salt,
                        BackUpPassword = userDto.Password,
                        RoleId = userDto.RoleId,
                        IsActive = userDto.IsActive,
                        CreateDate = DateTime.UtcNow,
                        CreateBy = userDto.Username
                    };

                    _context.Users.Add(user);
                }
                else
                {
                    // ===== UPDATE USER =====
                    user = await _context.Users.FindAsync(userDto.UserId);
                    if (user == null)
                        throw new KeyNotFoundException("User not found.");

                    user.EmployeeId = employee.EmployeeId;
                    user.RoleId = userDto.RoleId;
                    user.IsActive = userDto.IsActive;
                    user.UpdateDate = DateTime.UtcNow;
                    user.UpdateBy = userDto.Username;

                    if (!string.IsNullOrEmpty(userDto.Password))
                    {
                        user.Password = hashedPassword;
                        user.Salt = salt;
                        user.BackUpPassword = userDto.Password;
                    }

                    _context.Users.Update(user);
                }

                // ===== UPDATE EMPLOYEE ROLE =====
                if (employee.RoleId != userDto.RoleId)
                {
                    employee.RoleId = userDto.RoleId;
                    employee.UpdateDate = DateTime.UtcNow;
                    employee.UpdateBy = userDto.Username;

                    _context.Employees.Update(employee);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return user;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}

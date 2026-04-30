using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Middleware.Data;
using Middleware.Models;
using Middlewares.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace authentication_server.Services
{
    public class TokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string CreateToken(User user, decimal id, decimal? roleId, bool isSuperadmin = false)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.EmployeeId ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.NameId, id.ToString()),
                new Claim(ClaimTypes.Name, user.EmployeeId ?? string.Empty),
                new Claim(ClaimTypes.NameIdentifier, id.ToString()),
                new Claim(ClaimTypes.Role, roleId?.ToString() ?? string.Empty),
                new Claim("isSuperadmin", isSuperadmin.ToString().ToLower())
            };

            var jwtConfig = _configuration.GetSection("jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddMinutes(60),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Method to generate a salt
        public string GenerateSalt(int length = 32)
        {
            byte[] saltBytes = new byte[length];
            using (var rng = new RNGCryptoServiceProvider())
            {
                rng.GetBytes(saltBytes);
            }
            return Convert.ToBase64String(saltBytes);
        }

        // Method to hash password with salt using SHA256
        public string HashPassword(string password, string salt)
        {
            using (var sha256 = SHA256.Create())
            {
                var saltedPassword = password + salt;
                var saltedPasswordBytes = Encoding.UTF8.GetBytes(saltedPassword);
                var hashedPasswordBytes = sha256.ComputeHash(saltedPasswordBytes);
                return Convert.ToBase64String(hashedPasswordBytes);
            }
        }


    }
}


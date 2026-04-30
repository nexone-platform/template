using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Middleware.Data;
using Middlewares.Models;
using System.Globalization;


namespace Attendance_Server.Service
{


    public class SystemConfigService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _cache;

        public SystemConfigService(
            ApplicationDbContext context,
            IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<string> GetStringAsync(string key)
        {
            var config = await GetConfigAsync(key);
            return config?.ConfigValue ?? string.Empty;
        }

        public async Task<int> GetIntAsync(string key)
        {
            var value = await GetRequiredValueAsync(key);

            if (!int.TryParse(value, out var result))
                throw new Exception($"Config '{key}' is not a valid int.");

            return result;
        }

        public async Task<double> GetDoubleAsync(string key)
        {
            var value = await GetRequiredValueAsync(key);

            if (!double.TryParse(
                    value,
                    NumberStyles.Any,
                    CultureInfo.InvariantCulture,
                    out var result))
                throw new Exception($"Config '{key}' is not a valid decimal.");

            return result;
        }

        public async Task<bool> GetBoolAsync(string key)
        {
            var value = await GetRequiredValueAsync(key);

            if (!bool.TryParse(value, out var result))
                throw new Exception($"Config '{key}' is not a valid boolean.");

            return result;
        }

        private async Task<string> GetRequiredValueAsync(string key)
        {
            var config = await GetConfigAsync(key);

            if (config == null || string.IsNullOrWhiteSpace(config.ConfigValue))
                throw new Exception($"Config '{key}' not found.");

            return config.ConfigValue;
        }

        private async Task<SystemConfig?> GetConfigAsync(string key)
        {
            return await _cache.GetOrCreateAsync($"sysconfig_{key}", async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);

                return await _context.SystemConfigs
                    .Where(x => x.ConfigKey == key && x.IsActive)
                    .FirstOrDefaultAsync();
            });
        }
    }
}

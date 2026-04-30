using Microsoft.EntityFrameworkCore;
using Middleware.Data;
using Middlewares;

namespace authentication_server.Services
{
    public class DataSettingsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILoggingService _loggingService;

        public DataSettingsService(ApplicationDbContext context, ILoggingService loggingService, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _loggingService = loggingService;
            _httpContextAccessor = httpContextAccessor;

        }
        public class ApiResponse<T>
        {
            public List<T>? Data { get; set; }
            public int TotalData { get; set; }
        }
        public class InitDataRequest
        {
            public string Username { get; set; }
        }

    }
}

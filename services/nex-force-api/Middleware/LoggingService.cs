using Middleware.Data;
using Middlewares.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares
{
    public interface ILoggingService
    {
        void LogError(string errorMessageTh, string errorMessageEn, string pageName, string createdBy);
    }
    public class LoggingService : ILoggingService
    {
        private readonly ApplicationDbContext _context;

        public LoggingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public void LogError(string errorMessageTh, string errorMessageEn, string pageName, string createdBy)
        {
            var log = new Logs
            {
                ErrorMessageTh = errorMessageTh,
                ErrorMessageEn = errorMessageEn,
                PageName = pageName,
                CreateDate = DateTime.UtcNow,
                CreateBy = createdBy
            };
            _context.LoggError.Add(log);
            _context.SaveChanges();
        }
    }
}

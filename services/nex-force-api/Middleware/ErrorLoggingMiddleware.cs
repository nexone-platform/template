using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Middlewares
{
    public class ErrorLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceProvider _serviceProvider; // Inject IServiceProvider

        public ErrorLoggingMiddleware(RequestDelegate next, IServiceProvider serviceProvider)
        {
            _next = next;
            _serviceProvider = serviceProvider;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                // Create a new scope to resolve scoped services like ApplicationDbContext
                using (var scope = _serviceProvider.CreateScope())
                {
                    var loggingService = scope.ServiceProvider.GetRequiredService<ILoggingService>();

                    loggingService.LogError(
                        errorMessageTh: ex.Message,          // Capture error message in Thai (customize if needed)
                        errorMessageEn: ex.Message,          // Capture error message in English
                        pageName: context.Request.Path,      // Log the request path
                        createdBy: "System"                  // Replace with the actual user if available
                    );
                }

                context.Response.StatusCode = 500;
                await context.Response.WriteAsync("An unexpected error occurred.");
            }
        }
    }

}

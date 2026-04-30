using Microsoft.AspNetCore.Http;
using Middleware.Data;
using Middlewares.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using MimeKit.Text;
using MailKit.Net.Smtp;
using MailKit.Security;

namespace Middlewares
{
    public class EmailNotificationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailNotificationMiddleware> _logger;


        public EmailNotificationMiddleware(
            RequestDelegate next,
            IConfiguration configuration,
            ILogger<EmailNotificationMiddleware> logger)
        {
            _next = next;
            _configuration = configuration;
            _logger = logger;
        }

     


 
        
    }
}

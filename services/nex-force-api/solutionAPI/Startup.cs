

using Microsoft.AspNetCore.Rewrite;

using Microsoft.EntityFrameworkCore;

using Microsoft.OpenApi.Models;

using Middleware.Data;
using Microsoft.Extensions.DependencyInjection;
using solutionAPI.Services;
using Middlewares;

namespace solutionAPI;

public class Startup(IConfiguration configuration)
{
    private IConfiguration Configuration { get; } = configuration;

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        services.AddControllers();
        services.AddHttpContextAccessor(); 
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "Employee Result Service", Version = "v1" });
        });
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll",
                policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
        });
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        services.AddTransient<ILoggingService, LoggingService>();
        services.AddTransient<LeaveQuotaService>();
        services.AddTransient<LeaveRequestService>();
        services.AddScoped<EmploymentService>();
        services.AddTransient<TasksService>();
        services.AddScoped<TimesheetService>();
        services.AddTransient<ApprovalService>();
        services.AddTransient<ApprovalHistoryService>();
        services.AddTransient<EmailService>();
        services.AddTransient<ProjectService>();
        services.AddTransient<ProjectCostService>();
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        // Apply X-Forwarded headers from Gateway so API generates correct full image URLs
        app.Use(async (context, next) =>
        {
            if (context.Request.Headers.TryGetValue("X-Forwarded-Host", out var host))
            {
                context.Request.Host = new HostString(host.ToString());
            }
            if (context.Request.Headers.TryGetValue("X-Forwarded-Proto", out var proto))
            {
                context.Request.Scheme = proto.ToString();
            }
            await next();
        });
        app.UseMiddleware<ErrorLoggingMiddleware>();
        app.UseCors("AllowAll");
        app.UseSwagger();

        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Catalog V1");
        });
        app.UseStaticFiles();
        var option = new RewriteOptions();
        option.AddRedirect("^$", "swagger");
        app.UseRewriter(option);

       // app.UseHttpsRedirection();

        app.UseRouting();

        app.UseAuthentication();

        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
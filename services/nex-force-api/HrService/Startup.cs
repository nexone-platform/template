

using Microsoft.AspNetCore.Rewrite;

using Microsoft.EntityFrameworkCore;

using Microsoft.OpenApi.Models;

using Middleware.Data;
using Microsoft.Extensions.DependencyInjection;
using HrService.Services;
using Middlewares;

namespace HrService;

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
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "HrService Result Service", Version = "v1" });
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
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        services.AddScoped<PayrolItemService>();
        services.AddScoped<PayrollService>();
        services.AddScoped<SalaryService>();
        services.AddScoped<TaxService>();
        services.AddScoped<ReportTimesheetService>();
        services.AddScoped<RegistrationService>();

        services.AddScoped<LeaveReportsService>();
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
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

        //app.UseHttpsRedirection();

        app.UseRouting();

        app.UseAuthentication();

        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
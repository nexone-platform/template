using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using System.Text;

namespace gateway;

public class Startup(IConfiguration configuration)
{
    public IConfiguration Configuration { get; } = configuration;

    public void ConfigureServices(IServiceCollection services)
    {
        // Ocelot
        services.AddOcelot(Configuration);

        // Controllers
        services.AddControllers();
        services.AddHttpContextAccessor();

        // JWT Authentication
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(Configuration["jwt:Key"]))
                };
            });

        // CORS
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        // Swagger
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "API Gateway",
                Version = "v1"
            });
        });
    }

    public async void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        // CORS
        app.UseCors("AllowAll");

        // Swagger
        app.UseSwagger();
        app.UseSwaggerUI(ui =>
        {
            ui.SwaggerEndpoint("/swagger/v1/swagger.json", "API Gateway V1");
        });

        // Rewrite root "/"
        var rewrite = new RewriteOptions();
        rewrite.AddRedirect("^$", "swagger");
        app.UseRewriter(rewrite);

        app.UseRouting();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });

        // Inject Forwarded headers so Ocelot passes the public host to downstream services
        app.Use(async (context, next) =>
        {
            context.Request.Headers["X-Forwarded-Host"] = context.Request.Host.Value;
            if (!context.Request.Headers.ContainsKey("X-Forwarded-Proto"))
            {
                context.Request.Headers["X-Forwarded-Proto"] = context.Request.Scheme;
            }
            await next();
        });

        // Ocelot MUST RUN LAST
        await app.UseOcelot();
    }
}

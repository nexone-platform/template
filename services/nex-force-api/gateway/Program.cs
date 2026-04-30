using gateway;

var builder = Host.CreateDefaultBuilder(args)
    .ConfigureAppConfiguration((hostingContext, config) =>
    {
        var env = hostingContext.HostingEnvironment;

        config
            .SetBasePath(env.ContentRootPath)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true);

        // ── Ocelot config loading ──
        // Development: ocelot.json           → localhost + original ports
        // Docker:      ocelot.Docker.json    → Docker service names + port 8080
        // Production:  ocelot.Production.json → production hosts (if exists)
        //
        // Priority: environment-specific file > ocelot.json (fallback)
        var ocelotEnvFile = $"ocelot.{env.EnvironmentName}.json";
        if (File.Exists(Path.Combine(env.ContentRootPath, ocelotEnvFile)))
        {
            config.AddJsonFile(ocelotEnvFile, optional: false, reloadOnChange: true);
        }
        else
        {
            config.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
        }

        config.AddEnvironmentVariables();

        if (env.IsDevelopment())
        {
            config.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
        }
    })
    .ConfigureWebHostDefaults(webBuilder =>
    {
        webBuilder.UseStartup<Startup>();
    });

builder.Build().Run();

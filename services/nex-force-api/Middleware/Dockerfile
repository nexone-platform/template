# ---------- Stage 1: Build ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Middleware/Middlewares.csproj Middleware/
RUN dotnet restore Middleware/Middlewares.csproj

COPY . .
WORKDIR /src/Middleware
RUN dotnet publish "Middlewares.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ---------- Stage 2: Runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Middlewares.dll"]


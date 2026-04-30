
# FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# WORKDIR /src
# COPY HrService/HrService.csproj HrService/
# RUN dotnet restore HrService/HrService.csproj
# COPY . .
# WORKDIR /src/HrService
# RUN dotnet publish -c Release -o /app/publish

# FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
# WORKDIR /app
# COPY --from=build /app/publish .
# ENTRYPOINT ["dotnet", "HrService.dll"]

# ---------- Stage 1: Build ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore
COPY HrService/HrService.csproj HrService/
RUN dotnet restore HrService/HrService.csproj

# Copy all source
COPY . .

# Publish
WORKDIR /src/HrService
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# ---------- Stage 2: Runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# ✅ Make sure .NET listens on all network interfaces
ENV ASPNETCORE_URLS=http://0.0.0.0:8080

# Expose port
EXPOSE 8080

# Run the app
ENTRYPOINT ["dotnet", "HrService.dll"]

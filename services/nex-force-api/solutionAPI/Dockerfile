# ---------- Stage 1: Build ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY solutionAPI/solutionAPI.csproj solutionAPI/
RUN dotnet restore solutionAPI/solutionAPI.csproj

# Copy the rest of the source code
COPY . .
WORKDIR /src/solutionAPI

# ✅ Explicitly publish this specific project
RUN dotnet publish "solutionAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ---------- Stage 2: Runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "solutionAPI.dll"]

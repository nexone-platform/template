# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY Attendance-Server/Attendance-Server.csproj Attendance-Server/
RUN dotnet restore Attendance-Server/Attendance-Server.csproj
COPY . .
WORKDIR /src/Attendance-Server
RUN dotnet publish "Attendance-Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Attendance-Server.dll"]

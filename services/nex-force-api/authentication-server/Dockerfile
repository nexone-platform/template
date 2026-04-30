FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY authentication-server/authentication-server.csproj authentication-server/
RUN dotnet restore authentication-server/authentication-server.csproj

COPY . .
WORKDIR /src/authentication-server

# ✅ Explicitly publish this specific project
RUN dotnet publish "authentication-server.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "authentication-server.dll"]

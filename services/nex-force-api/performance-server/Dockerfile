FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY performance-server/performance-server.csproj performance-server/
RUN dotnet restore performance-server/performance-server.csproj
COPY . .
WORKDIR /src/performance-server
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "performance-server.dll"]

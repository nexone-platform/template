# ---------- Stage 1: Build ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY gateway/gateway.csproj gateway/
RUN dotnet restore gateway/gateway.csproj

COPY . .

WORKDIR /src/gateway
RUN dotnet publish "gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ---------- Stage 2: Runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# copy output
COPY --from=build /app/publish .

# copy ocelot configs (Program.cs picks the right one based on ASPNETCORE_ENVIRONMENT)
COPY gateway/ocelot.json ./ocelot.json
COPY gateway/ocelot.Docker.json ./ocelot.Docker.json

# expose port
EXPOSE 8080

ENTRYPOINT ["dotnet", "gateway.dll"]

# ============================================
#  HRMIS Backend - Local Dev Server (PowerShell)
#  Auto-rebuild on file save using dotnet watch
# ============================================
# Usage:
#   .\dev-server.ps1                 # Start all services
#   .\dev-server.ps1 solutionapi     # Start single service
#   .\dev-server.ps1 stop            # Stop all dotnet processes
# ============================================

param(
    [string]$Service = "all"
)

$services = @{
    "gateway"     = @{ Path = "gateway";              Project = "gateway.csproj";               Port = 8001 }
    "solutionapi" = @{ Path = "solutionAPI";           Project = "solutionAPI.csproj";            Port = 5011 }
    "auth"        = @{ Path = "authentication-server"; Project = "authentication-server.csproj";  Port = 7246 }
    "hr"          = @{ Path = "HrService";             Project = "HrService.csproj";              Port = 7140 }
    "attendance"  = @{ Path = "Attendance-Server";     Project = "Attendance-Server.csproj";      Port = 7127 }
    "performance" = @{ Path = "performance-server";    Project = "performance-server.csproj";     Port = 7260 }
}

$backendRoot = $PSScriptRoot

function Start-Service {
    param([string]$Name)
    
    $svc = $services[$Name]
    if (-not $svc) {
        Write-Host "Unknown service: $Name" -ForegroundColor Red
        Write-Host "Available: $($services.Keys -join ', ')" -ForegroundColor Yellow
        return
    }

    $svcPath = Join-Path $backendRoot $svc.Path
    $project = $svc.Project
    $port = $svc.Port

    Write-Host "Starting $Name on port :$port with dotnet watch..." -ForegroundColor Cyan
    
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$svcPath'; `$Host.UI.RawUI.WindowTitle = 'HRMIS - $Name (:$port)'; dotnet watch run --project $project --launch-profile https"
    )
}

function Stop-AllServices {
    Write-Host "Stopping all backend services..." -ForegroundColor Yellow
    
    foreach ($svc in $services.GetEnumerator()) {
        $port = $svc.Value.Port
        $pids = netstat -ano | Select-String ":$port\s+.*LISTENING" | ForEach-Object {
            ($_ -split '\s+')[-1]
        } | Sort-Object -Unique
        
        foreach ($pid in $pids) {
            if ($pid -and $pid -ne "0") {
                try {
                    $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($proc) {
                        Write-Host "  Stopping $($svc.Key) (PID: $pid)..." -ForegroundColor DarkYellow
                        Stop-Process -Id $pid -Force
                    }
                } catch {}
            }
        }
    }
    
    Write-Host "All services stopped." -ForegroundColor Green
}

# ============================================
# Main
# ============================================
switch ($Service.ToLower()) {
    "stop" {
        Stop-AllServices
    }
    "all" {
        Write-Host ""
        Write-Host "  ============================================" -ForegroundColor Magenta
        Write-Host "   HRMIS Backend Dev Server (dotnet watch)" -ForegroundColor Magenta
        Write-Host "  ============================================" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "  Services will auto-rebuild on file save!" -ForegroundColor Green
        Write-Host ""

        foreach ($name in @("gateway", "solutionapi", "auth", "hr", "attendance", "performance")) {
            Start-Service -Name $name
            Start-Sleep -Seconds 3
        }
        
        Write-Host ""
        Write-Host "All services started in separate windows." -ForegroundColor Green
        Write-Host "Each window watches for .cs file changes and auto-rebuilds." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "To stop all: .\dev-server.ps1 stop" -ForegroundColor Yellow
    }
    default {
        Start-Service -Name $Service.ToLower()
    }
}

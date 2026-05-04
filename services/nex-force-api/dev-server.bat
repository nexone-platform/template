@echo off
REM ============================================
REM  HRMIS Backend - Local Dev Server
REM  Auto-rebuild on file save using dotnet watch
REM ============================================
REM Usage: double-click or run from terminal
REM   dev-server.bat              (start all services)
REM   dev-server.bat solutionapi  (start only solutionAPI)
REM   dev-server.bat gateway      (start only gateway)
REM ============================================

title HRMIS Backend Dev Server

set SERVICE=%1

if "%SERVICE%"=="" (
    echo ============================================
    echo   Starting ALL backend services with watch
    echo ============================================
    echo.
    echo   [1] gateway          :8102
    echo   [2] solutionAPI      :5011
    echo   [3] authentication   :7246
    echo   [4] HrService        :7140
    echo   [5] Attendance       :7127
    echo   [6] performance      :7260
    echo ============================================
    echo.

    start "Gateway"        cmd /k "cd /d %~dp0gateway               && dotnet watch run --project gateway.csproj               --launch-profile https"
    timeout /t 3 /nobreak >nul
    start "SolutionAPI"    cmd /k "cd /d %~dp0solutionAPI            && dotnet watch run --project solutionAPI.csproj           --launch-profile https"
    timeout /t 2 /nobreak >nul
    start "Auth Server"    cmd /k "cd /d %~dp0authentication-server  && dotnet watch run --project authentication-server.csproj --launch-profile https"
    timeout /t 2 /nobreak >nul
    start "HR Service"     cmd /k "cd /d %~dp0HrService              && dotnet watch run --project HrService.csproj             --launch-profile https"
    timeout /t 2 /nobreak >nul
    start "Attendance"     cmd /k "cd /d %~dp0Attendance-Server      && dotnet watch run --project Attendance-Server.csproj     --launch-profile https"
    timeout /t 2 /nobreak >nul
    start "Performance"    cmd /k "cd /d %~dp0performance-server     && dotnet watch run --project performance-server.csproj    --launch-profile https"

    echo.
    echo All services started in separate windows.
    echo Each window will auto-rebuild when you save .cs files.
    echo Close this window or press any key to exit.
    pause >nul
    goto :eof
)

REM --- Single service mode ---
if /I "%SERVICE%"=="gateway" (
    cd /d %~dp0gateway
    dotnet watch run --project gateway.csproj --launch-profile https
) else if /I "%SERVICE%"=="solutionapi" (
    cd /d %~dp0solutionAPI
    dotnet watch run --project solutionAPI.csproj --launch-profile https
) else if /I "%SERVICE%"=="auth" (
    cd /d %~dp0authentication-server
    dotnet watch run --project authentication-server.csproj --launch-profile https
) else if /I "%SERVICE%"=="hr" (
    cd /d %~dp0HrService
    dotnet watch run --project HrService.csproj --launch-profile https
) else if /I "%SERVICE%"=="attendance" (
    cd /d %~dp0Attendance-Server
    dotnet watch run --project Attendance-Server.csproj --launch-profile https
) else if /I "%SERVICE%"=="performance" (
    cd /d %~dp0performance-server
    dotnet watch run --project performance-server.csproj --launch-profile https
) else (
    echo Unknown service: %SERVICE%
    echo Available: gateway, solutionapi, auth, hr, attendance, performance
    pause
)

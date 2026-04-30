@echo off
title NexOne Project Runner
color 0A

:menu
cls
echo =======================================================
echo                 NEXONE PROJECT RUNNER
echo =======================================================
echo.
echo    [1] Run All (Frontend + Backend)
echo    [2] Run Frontend Only
echo    [3] Run Backend Only
echo    [0] Exit
echo.
echo =======================================================
set /p choice="Please select an option (0-3): "

if "%choice%"=="1" goto run_all
if "%choice%"=="2" goto run_frontend
if "%choice%"=="3" goto run_backend
if "%choice%"=="0" goto exit

echo Invalid choice. Please try again.
pause
goto menu

:run_all
cls
echo Starting All Services...
echo =======================================================
call npm run dev
pause
goto menu

:run_frontend
cls
echo Starting Frontend Only...
echo =======================================================
call npm run dev:frontend
pause
goto menu

:run_backend
cls
echo Starting Backend Only...
echo =======================================================
call npm run dev:backend
pause
goto menu

:exit
exit

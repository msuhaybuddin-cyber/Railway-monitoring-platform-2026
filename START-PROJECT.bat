@echo off
title Railway Signaling Monitoring Platform Launcher
color 0b
echo =====================================================================
echo    STARTING RAILWAY SIGNALING MONITORING PLATFORM (MERN STACK)
echo =====================================================================
echo.
cd /d "%~dp0"

echo [1/3] Starting Backend Server (Port 5000)...
start "Railway Backend API [Port 5000]" cmd /k "cd backend && npm start"

echo [2/3] Starting Frontend Client (Port 5173)...
start "Railway Frontend UI [Port 5173]" cmd /k "cd frontend && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

echo.
echo Launching Web Browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo =====================================================================
echo    PLATFORM RUNNING SUCCESSFULLY!
echo    - Frontend Portal: http://localhost:5173
echo    - Backend API:     http://localhost:5000
echo    - Demo Login:      Username: admin  ^|  Password: admin123
echo =====================================================================
echo Keep the backend and frontend command windows open while using the app.
echo.
pause

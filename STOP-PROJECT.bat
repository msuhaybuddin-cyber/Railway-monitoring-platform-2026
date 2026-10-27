@echo off
title Stop Railway Signaling Platform
color 0c
echo =====================================================================
echo    STOPPING RAILWAY MONITORING SERVERS
echo =====================================================================
echo.
echo Stopping Node.js processes...
taskkill /F /IM node.exe /T 2>nul
echo.
echo All Railway servers stopped cleanly.
echo.
pause

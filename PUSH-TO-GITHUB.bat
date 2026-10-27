@echo off
title Push Railway Monitoring Platform to GitHub
color 0b
echo =====================================================================
echo    PUSH RAILWAY SIGNALING MONITORING PLATFORM TO GITHUB
echo =====================================================================
echo.
cd /d "%~dp0"

REM Ensure Git is in PATH
set "PATH=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd;%PATH%"

echo [1/3] Preparing Git Repository...
git branch -M main
git add .
git commit -m "Release: Centralized Railway Signaling Monitoring Platform (MERN Stack)" 2>nul

echo.
echo =====================================================================
echo  Step 1: Go to GitHub and create an empty repository:
echo  https://github.com/new
echo.
echo  Name it: railway-monitoring-platform
echo  (Important: Do NOT check 'Add README' or '.gitignore')
echo =====================================================================
echo.
set /p REPO_URL="Step 2: Paste your GitHub repository URL here and press Enter: "

if "%REPO_URL%"=="" (
    echo.
    echo [ERROR] No URL entered. Please try again.
    pause
    exit /b
)

echo.
echo [2/3] Connecting to remote origin...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo [3/3] Uploading all code to GitHub (main branch)...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================================
    echo   SUCCESS! Your project is now published on GitHub!
    echo   Repository URL: %REPO_URL%
    echo =====================================================================
) else (
    echo.
    echo =====================================================================
    echo   [TROUBLESHOOTING TIP]
    echo   If GitHub asked for a password, GitHub uses Personal Access Tokens.
    echo   You can generate a token at: https://github.com/settings/tokens
    echo =====================================================================
)

echo.
pause

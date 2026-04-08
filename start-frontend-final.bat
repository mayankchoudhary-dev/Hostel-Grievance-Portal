@echo off
echo Starting Frontend Server - Final Fix
echo ==================================

cd frontend

echo Step 1: Kill any existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Step 2: Verify register.html exists...
if exist "register.html" (
    echo [OK] register.html found
) else (
    echo [ERROR] register.html NOT found
    echo Current directory contents:
    dir *.html
    pause
    exit /b
)

echo Step 3: Start enhanced frontend server...
echo.
echo Server will be available at: http://localhost:5500
echo Testing URLs:
echo - http://localhost:5500/index.html
echo - http://localhost:5500/register.html
echo - http://localhost:5500/admin-dashboard.html
echo - http://localhost:5500/student-dashboard.html
echo.

node server-fixed.js

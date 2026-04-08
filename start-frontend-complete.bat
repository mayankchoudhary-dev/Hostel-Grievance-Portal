@echo off
echo ==========================================
echo Starting Complete Frontend Server
echo ==========================================
echo.

cd frontend

echo Step 1: Kill all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Step 2: Verify register.html exists...
if exist "register.html" (
    echo [OK] register.html found
) else (
    echo [ERROR] register.html NOT found
    echo Current directory: %CD%
    dir *.html
    pause
    exit /b
)

echo Step 3: Start complete frontend server...
echo.
echo Server will be available at: http://localhost:5500
echo All routes will be logged in detail
echo.

node server-complete.js

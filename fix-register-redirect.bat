@echo off
echo Fixing Register.html Redirect Issue
echo ==================================
echo.

echo Step 1: Kill any existing frontend processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Step 2: Check if register.html exists...
cd frontend
if exist "register.html" (
    echo [OK] register.html found in frontend directory
) else (
    echo [ERROR] register.html NOT found in frontend directory
    echo Current directory: %CD%
    dir *.html
    pause
    exit /b
)

echo Step 3: Start frontend server with debug...
echo Starting server on port 5500...
echo Server will be available at: http://localhost:5500
echo.
echo Testing routes will be available at:
echo - http://localhost:5500/index.html
echo - http://localhost:5500/register.html
echo - http://localhost:5500/admin-dashboard.html
echo - http://localhost:5500/student-dashboard.html
echo.

node server.js

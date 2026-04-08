@echo off
echo Starting Backend Server with Static File Serving
echo ================================================

echo Step 1: Kill any existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Step 2: Check if backend/public directory exists...
cd backend
if not exist "public\index.html" (
    echo [ERROR] Frontend files not found in backend/public/
    echo Please run: fix-structure-complete.bat first
    pause
    exit /b
)

echo Step 3: Verify frontend files in backend/public...
echo Files in backend/public:
dir public\*.html
echo.

echo Step 4: Start backend server...
echo Server will run on port 5000
echo Static files served from backend/public/
echo.
echo Test URLs:
echo - http://localhost:5000/register.html
echo - http://localhost:5000/index.html
echo - http://localhost:5000/admin-dashboard.html
echo - http://localhost:5000/student-dashboard.html
echo.

node server.js

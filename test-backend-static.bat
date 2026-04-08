@echo off
echo Testing Backend Static File Serving
echo ==================================

echo Step 1: Kill any existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Step 2: Verify backend/public structure...
cd backend
if not exist "public\index.html" (
    echo [ERROR] index.html not found in backend/public/
    echo Please run move-to-backend-public.bat first
    pause
    exit /b
)

echo Step 3: Start backend server...
echo Server will serve static files from backend/public/
echo.
echo Test URLs:
echo - http://localhost:5001/index.html
echo - http://localhost:5001/register.html
echo - http://localhost:5001/admin-dashboard.html
echo - http://localhost:5001/student-dashboard.html
echo.

node server.js

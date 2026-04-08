@echo off
echo Force Starting Backend Server
echo ============================

echo Step 1: Kill ALL Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo [OK] All Node.js processes killed

echo Step 2: Wait for cleanup...
timeout /t 3 >nul

echo Step 3: Check backend directory...
cd backend
if not exist "server.js" (
    echo [ERROR] server.js not found in backend directory
    echo Current directory: %CD%
    pause
    exit /b
)

echo Step 4: Check if public directory exists...
if not exist "public" (
    echo [WARNING] public directory not found, creating it...
    mkdir public
    mkdir public\css
    mkdir public\js
    echo [OK] Created public directory structure
)

echo Step 5: Check for frontend files...
if not exist "public\register.html" (
    echo [WARNING] register.html not found in public/
    echo Copying from frontend...
    if exist "..\frontend\register.html" (
        copy "..\frontend\register.html" "public\" >nul 2>&1
        echo [OK] Copied register.html
    ) else (
        echo [ERROR] register.html not found in frontend/
    )
)

echo Step 6: Start backend server...
echo Starting server on port 5000...
echo.
echo After server starts, test these URLs:
echo - http://localhost:5000/register.html
echo - http://localhost:5000/index.html
echo.

node server.js

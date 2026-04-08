@echo off
echo Testing Server Connectivity
echo ==========================

echo Step 1: Check if server is running...
curl http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Server is running on port 5000
    echo Testing static file serving...
    curl http://localhost:5000/register.html >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] register.html is accessible
        echo SUCCESS! Backend is working correctly
    ) else (
        echo [ERROR] register.html not accessible
        echo Check if register.html exists in backend/public/
    )
) else (
    echo [ERROR] Server not running on port 5000
    echo Starting server...
    cd backend
    start "Backend Server" cmd /k "node server.js"
    echo Waiting 5 seconds for server to start...
    timeout /t 5 >nul
    
    echo Testing again...
    curl http://localhost:5000/api/health >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Server started successfully
        echo Test URLs:
        echo - http://localhost:5000/register.html
        echo - http://localhost:5000/index.html
    ) else (
        echo [ERROR] Server failed to start
        echo Check server.js for errors
    )
)

pause

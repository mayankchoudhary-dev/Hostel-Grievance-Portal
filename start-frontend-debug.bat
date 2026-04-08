@echo off
echo Starting Frontend Server with Debug...
echo.

cd frontend

echo Checking if register.html exists...
if exist "register.html" (
    echo [OK] register.html found
) else (
    echo [ERROR] register.html NOT found in frontend directory
    pause
    exit /b
)

echo Checking if port 5500 is in use...
netstat -ano | findstr :5500 >nul 2>&1
if %errorlevel% equ 0 (
    echo Port 5500 is in use, killing process...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5500') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    echo [OK] Port cleared
)

echo Starting frontend server on port 5500...
echo Frontend will be available at: http://localhost:5500
echo.
echo Testing routes:
echo - http://localhost:5500/index.html
echo - http://localhost:5500/register.html  
echo - http://localhost:5500/admin-dashboard.html
echo - http://localhost:5500/student-dashboard.html
echo.

node server.js

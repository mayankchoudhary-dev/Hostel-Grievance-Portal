@echo off
echo Starting Frontend Server...
echo.

cd frontend

echo Checking if port 5500 is in use...
netstat -ano | findstr :5500 >nul 2>&1
if %errorlevel% equ 0 (
    echo Port 5500 is in use, killing process...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5500') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo Starting frontend server on port 5500...
echo Frontend will be available at: http://localhost:5500
echo.

node simple-server.js

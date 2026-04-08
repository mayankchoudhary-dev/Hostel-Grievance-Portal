@echo off
echo Starting Frontend Server with Logout Fix...
echo.

cd frontend

echo Checking if port 5500 is in use...
netstat -ano | findstr :5501 >nul 2>&1
if %errorlevel% equ 0 (
    echo Port 5501 is in use, killing process...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5501') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo Starting frontend server on port 5500...
echo Frontend will be available at: http://localhost:5500
echo Login page: http://localhost:5500/index.html
echo Student dashboard: http://localhost:5500/student-dashboard.html
echo Admin dashboard: http://localhost:5500/admin-dashboard.html
echo.

npm start

pause

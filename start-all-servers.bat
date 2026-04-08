@echo off
echo Starting All Servers for Hostel Grievance Portal
echo ==============================================
echo.

echo Step 1: Starting Backend Server...
cd backend
start "Backend Server" cmd /k "echo Backend Server Starting... && node server.js"

echo.
echo Step 2: Starting Frontend Server...
cd ../frontend
start "Frontend Server" cmd /k "echo Frontend Server Starting... && npm start"

echo.
echo ==============================================
echo Servers are starting in separate windows...
echo.
echo Backend will be available at: http://localhost:5001
echo Frontend will be available at: http://localhost:5500
echo.
echo Login page: http://localhost:5500/index.html
echo Registration: http://localhost:5500/register.html
echo Student Dashboard: http://localhost:5500/student-dashboard.html
echo Admin Dashboard: http://localhost:5500/admin-dashboard.html
echo.
echo Wait a few seconds for servers to fully start...
echo.

timeout /t 3 /nobreak >nul

echo Testing Backend Health...
curl -s http://localhost:5001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend is running
) else (
    echo [ERROR] Backend failed to start
)

echo.
echo Testing Frontend Health...
curl -s http://localhost:5500/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend is running
) else (
    echo [ERROR] Frontend failed to start
)

echo.
echo ==============================================
echo All servers should be running now!
echo Close this window or press any key to continue...
pause >nul

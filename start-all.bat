@echo off
echo ========================================
echo Starting Hostel Grievance Portal
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node server.js"

echo.
echo [2/2] Starting Frontend Server...
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "cd frontend && npm install && npm start"

echo.
echo ========================================
echo Servers are starting in separate windows
echo ========================================
echo.
echo Backend: http://localhost:5001
echo Frontend: http://localhost:5500
echo.
echo Access pages:
echo - Home: http://localhost:5500/
echo - Register: http://localhost:5500/register.html
echo - Admin Dashboard: http://localhost:5500/admin-dashboard.html
echo - Student Dashboard: http://localhost:5500/student-dashboard.html
echo.
echo Press any key to exit this window...
pause >nul

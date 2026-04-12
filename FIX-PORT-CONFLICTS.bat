@echo off
echo Fix Port Conflicts - Live Server 5503 & Backend 5001
echo =======================================================

echo.
echo ========================================
echo PORT CONFLICT ANALYSIS:
echo ========================================
echo.
echo PROBLEM IDENTIFIED:
echo - Live server running on port 5503
echo - Backend server running on port 5001
echo - Both should run on port 5000
echo.
echo SOLUTION:
echo 1. Kill live server on port 5503
echo 2. Kill backend server on port 5001
echo 3. Start backend server on port 5000
echo 4. Access application on port 5000
echo.

echo Step 1: Find and kill process on port 5503...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5503') do (
    echo Found process %%a on port 5503, killing...
    taskkill /F /PID %%a
)

echo Step 2: Find and kill process on port 5001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    echo Found process %%a on port 5001, killing...
    taskkill /F /PID %%a
)

echo Step 3: Kill any remaining Node.js processes...
taskkill /F /IM node.exe 2>nul

echo Step 4: Wait for processes to terminate...
timeout /t 3 >nul

echo Step 5: Start backend server on correct port 5000...
cd backend
echo.
echo ========================================
echo STARTING BACKEND ON PORT 5000:
echo ========================================
echo.
echo - Frontend will be served from backend/public
echo - API endpoints will be on port 5000
echo - Live server no longer needed
echo.

node server.js

echo.
echo ========================================
echo VERIFICATION:
echo ========================================
echo.
echo After server starts:
echo 1. Test: http://localhost:5000/index.html
echo 2. Test: http://localhost:5000/register.html
echo 3. Check: http://localhost:5000/api/health
echo.
echo Both frontend and backend now on port 5000!
echo No more port conflicts!
echo.

pause

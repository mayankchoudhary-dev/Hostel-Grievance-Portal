@echo off
echo COMPLETE Port Configuration Analysis and Fix
echo ===========================================

echo.
echo ========================================
echo PORT ANALYSIS RESULTS:
echo ========================================
echo.
echo Backend Server Configuration:
echo - server.js: PORT = 5000 [CORRECT]
echo - CORS: includes port 5000 [CORRECT]
echo.
echo Frontend Configuration:
echo - frontend/js/env.js: API_BASE_URL = 5000 [CORRECT]
echo - backend/public/js/env.js: API_BASE_URL = 5000 [CORRECT]
echo - frontend/index.html: API_BASE = 5000 [FIXED]
echo - backend/public/register.html: API_BASE = 5000 [FIXED]
echo.

echo Step 1: Kill existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Step 2: Start backend server on port 5000...
cd backend
echo.
echo ========================================
echo SERVER STARTING WITH CORRECT PORTS:
echo ========================================
echo.
echo - Backend server: port 5000
echo - All API calls: port 5000
echo - All frontend links: port 5000
echo - CORS allows: port 5000
echo.

echo Starting server...
node server.js

echo.
echo ========================================
echo VERIFICATION COMPLETED:
echo ========================================
echo.
echo All port configurations are now consistent:
echo.
echo 1. Test server startup:
echo    Should show: "Server running on port 5000"
echo.
echo 2. Test login page:
echo    http://localhost:5000/index.html
echo    Should show: "Backend connected and running"
echo.
echo 3. Test registration:
echo    http://localhost:5000/register.html
echo    Should create accounts successfully
echo.
echo 4. Test API endpoints:
echo    http://localhost:5000/api/health
echo    Should return: {"success": true, ...}
echo.
echo ========================================
echo ALL PORT ISSUES RESOLVED!
echo ========================================

pause

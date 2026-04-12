@echo off
echo Fixing Network Error - Failed to Fetch
echo =====================================

echo Step 1: Check if backend server is running...
tasklist | findstr node.exe >nul
if %errorlevel% equ 0 (
    echo [OK] Node.js server is running
) else (
    echo [ERROR] Node.js server is NOT running
    echo Starting backend server...
    cd backend
    node server.js
    goto :end
)

echo Step 2: Test backend API endpoint...
cd backend
curl -X POST http://localhost:5000/api/register -H "Content-Type: application/json" -d "{\"name\":\"test\",\"email\":\"test@test.com\",\"room_no\":\"A-101\",\"password\":\"123456\"}" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] API endpoint is working
) else (
    echo [ERROR] API endpoint is not responding
    echo Check server logs for errors
)

echo Step 3: Check CORS configuration...
echo [INFO] CORS should allow port 5000
echo [INFO] Updated server.js to include port 5000 in CORS origins

echo Step 4: Restart backend server with CORS fix...
echo Killing existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Starting backend server with CORS fix...
cd backend
node server.js

echo.
echo ========================================
echo TROUBLESHOOTING STEPS:
echo ========================================
echo.
echo 1. Make sure backend server is running:
echo    cd backend
echo    node server.js
echo.
echo 2. Check CORS configuration in server.js:
echo    Should include "http://localhost:5000" in origins
echo.
echo 3. Test API endpoint directly:
echo    curl -X POST http://localhost:5000/api/register
echo.
echo 4. Check browser console for CORS errors
echo.
echo 5. Verify register.html uses correct API URL:
echo    Should be: http://localhost:5000/api/register
echo.

:end
pause

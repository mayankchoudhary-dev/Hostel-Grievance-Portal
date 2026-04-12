@echo off
echo Fixing Register Page Not Found Error
echo ====================================

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

echo Step 2: Verify register.html exists in backend/public...
cd backend
if exist "public\register.html" (
    echo [OK] register.html found in backend/public
) else (
    echo [ERROR] register.html NOT found in backend/public
    echo Copying from frontend...
    if exist "..\frontend\register.html" (
        copy "..\frontend\register.html" "public\" >nul 2>&1
        echo [OK] register.html copied to backend/public
    ) else (
        echo [ERROR] register.html not found in frontend either
    )
)

echo Step 3: Check which port backend is using...
netstat -ano | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo [OK] Backend is running on port 5000
    echo Test URL: http://localhost:5000/register.html
) else (
    netstat -ano | findstr :5001 >nul
    if %errorlevel% equ 0 (
        echo [INFO] Backend is running on port 5001
        echo Test URL: http://localhost:5001/register.html
    ) else (
        echo [ERROR] Backend is not running on port 5000 or 5001
    )
)

echo.
echo ========================================
echo TROUBLESHOOTING STEPS:
echo ========================================
echo.
echo 1. Make sure backend server is running:
echo    cd backend
echo    node server.js
echo.
echo 2. Test register page directly:
echo    http://localhost:5000/register.html
echo.
echo 3. If still not working, check:
echo    - backend/public/register.html exists
echo    - backend server is running on port 5000
echo    - No firewall blocking port 5000
echo.
echo 4. Clear browser cache and try again
echo.

:end
pause

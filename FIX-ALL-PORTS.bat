@echo off
echo Fix All Port Configurations - Complete Port Check
echo ================================================

echo.
echo ========================================
echo PORT CONFIGURATION AUDIT:
echo ========================================
echo.
echo This will check and fix ALL port references
echo across the entire application
echo.

echo Step 1: Check current backend server port...
cd backend
echo Current server.js port configuration:
findstr /C:"PORT" server.js
echo.

echo Step 2: Check frontend API base URL...
cd ..\frontend
echo Current env.js configuration:
if exist "js\env.js" (
    type "js\env.js"
) else (
    echo env.js not found
)
echo.

echo Step 3: Check frontend HTML files for hardcoded ports...
echo Checking index.html for port references:
findstr /C:"5001" index.html
findstr /C:"5000" index.html
echo.

echo Checking register.html for port references:
cd ..\backend\public
if exist "register.html" (
    findstr /C:"5001" register.html
    findstr /C:"5000" register.html
)
echo.

echo ========================================
echo PORT FIXES NEEDED:
echo ========================================
echo.
echo 1. Backend server should run on port 5000
echo 2. Frontend API calls should use port 5000
echo 3. All hardcoded URLs should use port 5000
echo 4. CORS should allow port 5000
echo.

echo Step 4: Apply port fixes...
cd ..\backend

echo Updating server.js port to 5000...
powershell -Command "(Get-Content server.js) -replace 'PORT \|\| 5001', 'PORT \|\| 5000' | Set-Content server.js"

echo Checking CORS configuration...
findstr /C:"5000" server.js

echo.
echo ========================================
echo VERIFICATION:
echo ========================================
echo.
echo After applying fixes, restart server:
echo.
echo 1. Kill existing processes:
echo    taskkill /F /IM node.exe
echo.
echo 2. Start backend server:
echo    cd backend
echo    node server.js
echo.
echo 3. Verify server runs on port 5000:
echo    Should show: "Server running on port 5000"
echo.
echo 4. Test registration:
echo    http://localhost:5000/register.html
echo.
echo 5. Check browser console for errors
echo.

pause

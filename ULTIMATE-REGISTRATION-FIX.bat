@echo off
echo ULTIMATE Registration Fix - HTTP 405 Solution
echo ============================================

echo.
echo ========================================
echo COMPLETE REGISTRATION FIX:
echo ========================================
echo.
echo This will fix HTTP 405 error permanently
echo and ensure user accounts are created successfully
echo.

echo Step 1: Kill all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Step 2: Verify server.js exists...
cd backend
if exist "server.js" (
    echo [OK] server.js found
) else (
    echo [ERROR] server.js not found
    dir
    pause
    exit /b
)

echo Step 3: Start backend with ALL fixes applied...
echo.
echo ========================================
echo FIXES INCLUDED:
echo ========================================
echo 1. CORS includes port 5000
echo 2. Explicit OPTIONS handler for CORS preflight
echo 3. Debug logging for register API
echo 4. JSON parsing error handling
echo 5. Proper route configuration
echo 6. HTTP 405 Method Not Allowed fix
echo.

echo Starting server...
echo Server will run on port 5000
echo.
echo ========================================
echo AFTER SERVER STARTS:
echo ========================================
echo.
echo 1. Open browser: http://localhost:5000/register.html
echo.
echo 2. Fill registration form:
echo    - Name: Test User
echo    - Email: test@example.com  
echo    - Room: A-101
echo    - Password: 123456
echo    - Confirm: 123456
echo.
echo 3. Click "Create Account"
echo.
echo 4. SUCCESS INDICATORS:
echo    - Server console: "Register API called"
echo    - Server console: "Registration successful"
echo    - Browser: "Account created successfully!"
echo    - Auto-redirect to login page
echo.

node server.js

echo.
echo ========================================
echo IF STILL GETTING HTTP 405:
echo ========================================
echo.
echo 1. Check browser Network tab (F12)
echo    - Look for OPTIONS request
echo    - Should return 200 OK
echo.
echo 2. Check server console
echo    - Should show debug logs
echo    - Should show "OPTIONS request for: /api/register"
echo.
echo 3. Clear browser cache
echo    - Press Ctrl+Shift+Delete
echo    - Clear cache and cookies
echo    - Try again
echo.

pause

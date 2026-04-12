@echo off
echo FINAL HTTP 405 Method Not Allowed Fix
echo =====================================

echo.
echo ========================================
echo UNDERSTANDING HTTP 405 ERROR:
echo ========================================
echo.
echo HTTP 405 Method Not Allowed means:
echo - The server received the request
echo - But the HTTP method (POST) is not allowed
echo - For the specific URL (/api/register)
echo.
echo COMMON CAUSES:
echo 1. CORS preflight request failing
echo 2. Backend server not restarted with fixes
echo 3. Middleware blocking POST requests
echo 4. Wrong route configuration
echo.
echo ========================================
echo APPLIED FIXES:
echo ========================================
echo.
echo 1. CORS includes port 5000
echo 2. Explicit OPTIONS handler added
echo 3. Debug logging enabled
echo 4. JSON parsing error handling
echo.
echo ========================================
echo FINAL SOLUTION:
echo ========================================
echo.

echo Step 1: Kill all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Step 2: Start backend server with ALL fixes...
cd backend
echo.
echo Server starting with:
echo - CORS preflight handling
echo - OPTIONS method support
echo - Debug logging
echo - Proper route configuration
echo.
echo Starting server on port 5000...
node server.js

echo.
echo ========================================
echo AFTER SERVER STARTS:
echo ========================================
echo.
echo 1. Test registration:
echo    http://localhost:5000/register.html
echo.
echo 2. Fill form and submit
echo.
echo 3. Check server console for:
echo    - "OPTIONS request for: /api/register"
echo    - "Register API called"
echo    - "Request body: {...}"
echo    - "Registration successful"
echo.
echo 4. If still 405 error:
echo    - Check browser Network tab
echo    - Verify OPTIONS request succeeds
echo    - Ensure server restarted properly
echo.

pause

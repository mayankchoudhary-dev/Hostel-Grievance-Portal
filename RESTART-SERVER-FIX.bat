@echo off
echo Restart Server with CORS Fix for HTTP 405
echo =====================================

echo Step 1: Kill all existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Step 2: Start backend server with updated CORS...
cd backend
echo.
echo ========================================
echo SERVER STARTING WITH FIXES:
echo ========================================
echo.
echo 1. CORS includes port 5000
echo 2. Explicit OPTIONS handler added
echo 3. Debug logging enabled
echo 4. JSON parsing error handling
echo.
echo Server will start on port 5000
echo.
echo ========================================
echo TEST INSTRUCTIONS:
echo ========================================
echo.
echo 1. Wait for server to start
echo.
echo 2. Open browser to register page:
echo    http://localhost:5000/register.html
echo.
echo 3. Fill registration form:
echo    - Name: Test User
echo    - Email: test@example.com
echo    - Room: A-101
echo    - Password: 123456
echo    - Confirm: 123456
echo.
echo 4. Click "Create Account"
echo.
echo 5. Check server console for:
echo    - "OPTIONS request for: /api/register"
echo    - "Register API called"
echo    - "Request body: {...}"
echo    - "Extracted data: {...}"
echo.
echo 6. Should see success message:
echo    "Account created successfully! Redirecting to login..."
echo.
echo If still getting 405 errors:
echo - Check browser Network tab (F12)
echo - Look for OPTIONS request failing
echo - Verify server is actually restarted
echo.

echo Starting server...
node server.js

pause

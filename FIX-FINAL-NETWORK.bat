@echo off
echo Fix Final Network Error - Failed to Fetch
echo =======================================

echo Step 1: Kill all existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Step 2: Start backend server...
cd backend
echo Starting server on port 5000...
node server.js

echo.
echo ========================================
echo FINAL FIX APPLIED:
echo ========================================
echo.
echo 1. Updated register.html to use relative URL:
echo    Before: http://localhost:5000/api/register
echo    After: /api/register
echo.
echo 2. This prevents CORS issues and port conflicts
echo.
echo 3. Updated CORS to include port 5000
echo.
echo 4. Added debug logging to register function
echo.
echo ========================================
echo TEST INSTRUCTIONS:
echo ========================================
echo.
echo 1. Backend server should be running on port 5000
echo.
echo 2. Open browser and go to:
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
echo 5. Should see success message:
echo    "Account created successfully! Redirecting to login..."
echo.
echo 6. Check server console for debug logs
echo.
echo If still failing:
echo - Check browser console for errors
echo - Verify backend server is running
echo - Check database connection
echo.

pause

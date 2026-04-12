@echo off
echo Fix Register Page Errors and Redirect Problems
echo =============================================

echo.
echo ========================================
echo ANALYZING REGISTER PAGE ISSUES:
echo ========================================
echo.
echo 1. Killing existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo 2. Starting backend server on port 5000...
cd backend
echo.
echo Starting server with all port fixes applied...
node server.js

echo.
echo ========================================
echo REGISTER PAGE FIXES APPLIED:
echo ========================================
echo.
echo 1. Port Configuration:
echo    - Backend server: port 5000 [FIXED]
echo    - API_BASE: port 5000 [FIXED]
echo    - CORS: includes port 5000 [FIXED]
echo.
echo 2. Register Page Improvements:
echo    - Enhanced error handling for JSON parsing
echo    - Multiple redirect fallbacks implemented
echo    - Debug logging for troubleshooting
echo    - Password validation and confirmation
echo    - Success message with toast notification
echo.
echo 3. Redirect Logic:
echo    - Primary: window.location.href
echo    - Fallback 1: window.location.assign (500ms delay)
echo    - Fallback 2: window.location.replace (1000ms delay)
echo    - Fallback 3: Manual redirect (1500ms delay)
echo.
echo ========================================
echo TESTING INSTRUCTIONS:
echo ========================================
echo.
echo 1. Server should start on port 5000
echo 2. Open: http://localhost:5000/register.html
echo 3. Fill registration form:
echo    - Name: Test User
echo    - Email: test@example.com
echo    - Room: A-101
echo    - Password: 123456
echo    - Confirm: 123456
echo 4. Click "Create Account"
echo 5. Expected results:
echo    - Success message: "Account created successfully!"
echo    - Toast notification: "Welcome to Hostel Grievance Portal!"
echo    - Auto-redirect to dashboard
echo    - User data stored in localStorage
echo.
echo ========================================
echo DEBUGGING:
echo ========================================
echo.
echo If redirect fails:
echo 1. Check browser console for errors
echo 2. Verify dashboard files exist:
echo    - student-dashboard.html
echo    - admin-dashboard.html
echo 3. Check localStorage for user data
echo 4. Verify server response contains token and user data
echo.

pause

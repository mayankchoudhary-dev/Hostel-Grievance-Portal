@echo off
echo Fix HTTP 405 Method Not Allowed Error
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

echo Step 2: Test register endpoint manually...
cd backend
node -e "
const express = require('express');
const app = express();

app.use(express.json());

// Test POST endpoint
app.post('/api/register', (req, res) => {
  console.log('Register endpoint called with:', req.body);
  res.json({ success: true, message: 'Test endpoint working' });
});

app.listen(5001, () => {
  console.log('Test server running on port 5001');
  console.log('Test with: curl -X POST http://localhost:5001/api/register -H "Content-Type: application/json" -d "{\"name\":\"test\"}"');
});
"

echo.
echo ========================================
echo HTTP 405 ERROR ANALYSIS:
echo ========================================
echo.
echo HTTP 405 Method Not Allowed means:
echo - The endpoint exists but doesn't accept POST method
echo - OR CORS preflight request is failing
echo - OR middleware is blocking the request
echo.
echo POSSIBLE CAUSES:
echo 1. register.html sending to wrong URL
echo 2. CORS preflight request failing
echo 3. Backend middleware blocking POST
echo 4. Wrong HTTP method being used
echo.
echo DEBUGGING STEPS:
echo.
echo 1. Check browser network tab:
echo    - Open DevTools (F12)
echo    - Go to Network tab
echo    - Submit registration form
echo    - Check the actual request URL and method
echo.
echo 2. Check server console:
echo    - Should show "Register API called"
echo    - Should show request body
echo    - Look for any error messages
echo.
echo 3. Test with curl:
echo    curl -X POST http://localhost:5000/api/register ^
echo         -H "Content-Type: application/json" ^
echo         -d "{\"name\":\"test\",\"email\":\"test@test.com\",\"room_no\":\"A-101\",\"password\":\"123456\"}"
echo.
echo 4. Check if frontend is sending OPTIONS request:
echo    - CORS preflight sends OPTIONS first
echo    - Server must respond with 200 OK
echo    - Then actual POST request is sent
echo.

:end
pause

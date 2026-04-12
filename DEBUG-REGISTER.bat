@echo off
echo Debug User Account Creation Failure
echo ==================================

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

echo Step 2: Test database connection...
cd backend
node -e "
const pool = require('./config/db');
pool.query('SELECT 1 as test')
  .then(([rows]) => {
    console.log('[OK] Database connection successful');
    console.log('Test result:', rows);
    process.exit(0);
  })
  .catch(err => {
    console.log('[ERROR] Database connection failed:', err.message);
    process.exit(1);
  });
"

echo Step 3: Check if users table exists...
node -e "
const pool = require('./config/db');
pool.query('DESCRIBE users')
  .then(([rows]) => {
    console.log('[OK] Users table exists');
    console.log('Table structure:');
    rows.forEach(row => console.log('  -', row.Field, row.Type));
    process.exit(0);
  })
  .catch(err => {
    console.log('[ERROR] Users table not found or error:', err.message);
    process.exit(1);
  });
"

echo Step 4: Test register API with debug logging...
echo Starting backend server with debug logging...
echo.
echo ========================================
echo DEBUG INSTRUCTIONS:
echo ========================================
echo.
echo 1. Start backend server:
echo    cd backend
echo    node server.js
echo.
echo 2. Try to register a new user
echo    Open: http://localhost:5000/register.html
echo    Fill form and click "Create Account"
echo.
echo 3. Check server console for debug messages:
echo    - "Register API called"
echo    - "Request body: ..."
echo    - "Extracted data: ..."
echo    - "Checking if email exists: ..."
echo    - "Email check result: ..."
echo    - "Hashing password..."
echo    - "Inserting user into database..."
echo    - "User inserted successfully, ID: ..."
echo    - "Registration successful for: ..."
echo.
echo 4. Common issues to check:
echo    - Database connection failure
echo    - Users table doesn't exist
echo    - Email already exists
echo    - Database permission issues
echo    - Missing required fields
echo.
echo 5. If you see errors in console:
echo    - Database error: Check MySQL connection
echo    - Email already registered: Use different email
echo    - Server error: Check database and permissions
echo.

:end
pause

@echo off
echo Fix MODULE_NOT_FOUND Error for server.js
echo ========================================

echo.
echo ========================================
echo ERROR ANALYSIS:
echo ========================================
echo.
echo Error: Cannot find module 'C:\Users\Mayank choudhary\Desktop\HGP_AntiG\backend\.server.js'
echo.
echo Problem: There's a DOT (.) before server.js in the path
echo Should be: server.js
echo Actual: .server.js
echo.
echo This happens when:
echo - Command has extra dot or space
echo - Working directory is wrong
echo - File path is malformed
echo.

echo Step 1: Check if server.js exists...
cd backend
if exist "server.js" (
    echo [OK] server.js found in backend directory
) else (
    echo [ERROR] server.js NOT found in backend directory
    echo Listing files in backend directory:
    dir /b
    goto :end
)

echo Step 2: Start server with correct command...
echo.
echo ========================================
echo CORRECT START COMMANDS:
echo ========================================
echo.
echo Option 1: From backend directory
echo   cd backend
echo   node server.js
echo.
echo Option 2: From project root
echo   node backend/server.js
echo.
echo Option 3: Using npm (if package.json has start script)
echo   cd backend
echo   npm start
echo.

echo Starting server with correct command...
node server.js

if %errorlevel% equ 0 (
    echo [OK] Server started successfully
) else (
    echo [ERROR] Server failed to start
    echo.
    echo Try manually:
    echo 1. Open Command Prompt
    echo 2. cd "C:\Users\Mayank choudhary\Desktop\HGP_AntiG\backend"
    echo 3. node server.js
)

:end
pause

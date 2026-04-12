@echo off
echo Kill Node.js Processes - Correct Commands
echo ========================================

echo.
echo ========================================
echo CORRECT COMMANDS TO KILL PROCESSES:
echo ========================================
echo.
echo 1. For Windows Command Prompt (cmd):
echo    taskkill /F /IM node.exe
echo.
echo 2. For Windows PowerShell:
echo    Stop-Process -Name node -Force
echo.
echo 3. Alternative PowerShell command:
echo    Get-Process node | Stop-Process -Force
echo.
echo 4. Using WMIC (works in both):
echo    wmic process where "name='node.exe'" delete
echo.
echo ========================================
echo TESTING EACH METHOD:
echo ========================================
echo.

echo Method 1: Using taskkill...
taskkill /F /IM node.exe
echo.

echo Method 2: Using wmic...
wmic process where "name='node.exe'" delete
echo.

echo Method 3: Using PowerShell...
powershell -Command "Stop-Process -Name node -Force"
echo.

echo ========================================
echo VERIFICATION:
echo ========================================
echo.

echo Checking if Node.js processes are still running...
tasklist | findstr node.exe
if %errorlevel% equ 0 (
    echo [WARNING] Node.js processes still running
) else (
    echo [SUCCESS] All Node.js processes killed
)

echo.
echo ========================================
echo START BACKEND SERVER:
echo ========================================
echo.
echo Now starting backend server...
cd backend
node server.js

pause

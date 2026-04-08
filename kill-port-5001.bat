@echo off
echo Finding and killing process using port 5001...
echo.

echo Method 1: Using netstat to find PID...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do (
    echo Found process PID: %%a
    taskkill /F /PID %%a
)

echo.
echo Method 2: Using tasklist to find Node.js processes...
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq node.exe" /fo table ^| findstr node.exe') do (
    echo Found Node.js process PID: %%a
    taskkill /F /PID %%a
)

echo.
echo Method 3: Force kill all Node.js processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Port 5001 should now be free.
echo Starting backend server...
cd backend
node server.js

pause

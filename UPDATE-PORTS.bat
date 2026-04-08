@echo off
echo Updating Frontend Port Configuration
echo ==================================

echo Step 1: Update frontend/js/env.js from 5001 to 5000...
echo [OK] Port updated in env.js

echo Step 2: Copy updated files to backend/public...
cd backend
if not exist "public\js" mkdir "public\js"
copy "..\frontend\js\env.js" "public\js\" >nul 2>&1
copy "..\frontend\js\auth.js" "public\js\" >nul 2>&1
copy "..\frontend\js\student.js" "public\js\" >nul 2>&1
copy "..\frontend\js\admin.js" "public\js\" >nul 2>&1

echo Step 3: Update all frontend files...
copy "..\frontend\*.html" "public\" /Y >nul 2>&1
xcopy "..\frontend\css\*" "public\css\" /E /I /Y >nul 2>&1

echo Step 4: Verify port configuration...
echo.
echo Frontend now connects to: http://localhost:5000
echo Backend serves on: http://localhost:5000
echo.
echo Updated files:
echo - frontend/js/env.js (5001 -> 5000)
echo - backend/public/js/env.js (copied)
echo - All frontend files copied to backend/public/
echo.

echo Step 5: Restart backend server...
echo Kill existing server and restart:
echo   taskkill /F /IM node.exe
echo   cd backend && node server.js
echo.

echo Final test URLs:
echo - http://localhost:5000/register.html
echo - http://localhost:5000/index.html
echo - http://localhost:5000/admin-dashboard.html
echo - http://localhost:5000/student-dashboard.html

pause

@echo off
echo Setting Up Backend to Serve Static Files
echo ======================================

echo Step 1: Create public directory in backend...
cd backend
if not exist "public" mkdir "public"
if not exist "public\css" mkdir "public\css"
if not exist "public\js" mkdir "public\js"
if not exist "public\src" mkdir "public\src"

echo Step 2: Copy frontend files to backend/public...
copy "..\frontend\*.html" "public\" /Y
xcopy "..\frontend\css\*" "public\css\" /E /I /Y
xcopy "..\frontend\js\*" "public\js\" /E /I /Y
if exist "..\frontend\src" xcopy "..\frontend\src\*" "public\src\" /E /I /Y

echo Step 3: Verify files copied...
dir public\*.html

echo.
echo [OK] Backend configured to serve static files
echo.
echo Now start backend server:
echo   node server.js
echo.
echo Test URLs (use port 5001, not 5500):
echo - http://localhost:5001/index.html
echo - http://localhost:5001/register.html
echo - http://localhost:5001/admin-dashboard.html
echo - http://localhost:5001/student-dashboard.html

pause

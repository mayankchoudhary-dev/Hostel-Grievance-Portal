@echo off
echo Copying Frontend Files to Backend Public Directory
echo ==============================================

echo Step 1: Create backend/public directories...
cd backend
if not exist "public" mkdir "public"
if not exist "public\css" mkdir "public\css"
if not exist "public\js" mkdir "public\js"

echo Step 2: Copy HTML files...
copy "..\frontend\index.html" "public\" >nul 2>&1
copy "..\frontend\register.html" "public\" >nul 2>&1
copy "..\frontend\student-dashboard.html" "public\" >nul 2>&1
copy "..\frontend\admin-dashboard.html" "public\" >nul 2>&1

echo Step 3: Copy CSS and JS folders...
xcopy "..\frontend\css\*" "public\css\" /E /I /Y >nul 2>&1
xcopy "..\frontend\js\*" "public\js\" /E /I /Y >nul 2>&1

echo Step 4: Verify files copied...
echo.
echo Files in backend/public:
dir public\*.html

echo Step 5: Clean up frontend server files...
cd "..\frontend"
if exist "server.js" del "server.js" >nul 2>&1
if exist "server-fixed.js" del "server-fixed.js" >nul 2>&1
if exist "server-complete.js" del "server-complete.js" >nul 2>&1
if exist "simple-server.js" del "simple-server.js" >nul 2>&1

echo.
echo [OK] All files copied to backend/public/
echo.
echo Final structure:
echo backend/
echo    server.js
echo    public/
echo        index.html
echo        register.html
echo        admin-dashboard.html
echo        student-dashboard.html
echo        css/
echo        js/
echo.
echo Now start backend server:
echo   cd backend && node server.js
echo.
echo Test URLs (port 5000):
echo   - http://localhost:5000/register.html
echo   - http://localhost:5000/index.html

pause

@echo off
echo Moving Frontend Files to Backend Public Folder
echo ===========================================

echo Step 1: Create backend/public directory structure...
cd backend
if not exist "public" mkdir "public"
if not exist "public\css" mkdir "public\css"
if not exist "public\js" mkdir "public\js"
if not exist "public\src" mkdir "public\src"

echo Step 2: Move HTML files...
move "..\frontend\index.html" "public\" >nul 2>&1
move "..\frontend\register.html" "public\" >nul 2>&1
move "..\frontend\student-dashboard.html" "public\" >nul 2>&1
move "..\frontend\admin-dashboard.html" "public\" >nul 2>&1

echo Step 3: Move CSS and JS folders...
xcopy "..\frontend\css\*" "public\css\" /E /I /Y >nul 2>&1
xcopy "..\frontend\js\*" "public\js\" /E /I /Y >nul 2>&1
if exist "..\frontend\src" xcopy "..\frontend\src\*" "public\src\" /E /I /Y >nul 2>&1

echo Step 4: Verify files moved successfully...
echo.
echo Files in backend/public:
dir public\*.html
echo.
echo CSS files in backend/public/css:
dir public\css\*.css
echo.
echo JS files in backend/public/js:
dir public\js\*.js

echo.
echo Step 5: Clean up unnecessary frontend server files...
cd ..\frontend
del server.js >nul 2>&1
del server-fixed.js >nul 2>&1
del server-complete.js >nul 2>&1
del simple-server.js >nul 2>&1
del package.json >nul 2>&1

echo.
echo [OK] Clean project structure created!
echo.
echo Final structure:
echo backend/
echo    server.js
echo    public/
echo       index.html
echo       register.html
echo       admin-dashboard.html
echo       student-dashboard.html
echo       css/
echo       js/
echo.
echo Test URLs (use port 5001):
echo - http://localhost:5001/index.html
echo - http://localhost:5001/register.html
echo - http://localhost:5001/admin-dashboard.html
echo - http://localhost:5001/student-dashboard.html

pause

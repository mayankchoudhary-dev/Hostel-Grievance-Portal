@echo off
echo Copying Frontend Files to Backend Public Folder
echo =============================================

echo Step 1: Create backend/public directory if not exists...
if not exist "backend\public" mkdir "backend\public"

echo Step 2: Copy frontend files to backend/public...
xcopy "frontend\*.html" "backend\public\" /Y
xcopy "frontend\css\*" "backend\public\css\" /E /I /Y
xcopy "frontend\js\*" "backend\public\js\" /E /I /Y

echo Step 3: Copy other frontend assets...
if exist "frontend\src" xcopy "frontend\src\*" "backend\public\src\" /E /I /Y

echo.
echo [OK] Frontend files copied to backend/public/
echo Now backend can serve static files
echo.
echo Test URLs:
echo - http://localhost:5001/index.html
echo - http://localhost:5001/register.html
echo - http://localhost:5001/admin-dashboard.html
echo - http://localhost:5001/student-dashboard.html

pause

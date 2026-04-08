@echo off
echo Creating Backend Public Directory Structure
echo =======================================

echo Step 1: Create backend/public directory...
cd backend
if not exist "public" (
    mkdir "public"
    echo [OK] Created backend/public directory
) else (
    echo [INFO] backend/public already exists
)

echo Step 2: Create subdirectories...
if not exist "public\css" mkdir "public\css"
if not exist "public\js" mkdir "public\js"
if not exist "public\src" mkdir "public\src"

echo Step 3: Verify directory structure...
echo.
echo Directory structure created:
dir public
echo.

echo Step 4: Ready to move files...
echo Now run these commands:
echo.
echo mv frontend/index.html backend/public/
echo mv frontend/register.html backend/public/
echo mv frontend/student-dashboard.html backend/public/
echo mv frontend/admin-dashboard.html backend/public/
echo.
echo cp -r frontend/css/* backend/public/css/
echo cp -r frontend/js/* backend/public/js/
echo.

pause

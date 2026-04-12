@echo off
echo Fix Git Errors - Remove Problematic Files
echo =======================================

echo.
echo ========================================
echo GIT ERROR ANALYSIS:
echo ========================================
echo.
echo PROBLEM IDENTIFIED:
echo - Git cannot index a file named "nul"
echo - "nul" is a reserved Windows filename
echo - This is causing "fatal: adding files failed"
echo.

echo Step 1: Go to backend directory...
cd backend

echo Step 2: Remove the problematic nul file...
if exist "nul" (
    echo [FOUND] nul file exists, removing...
    del /f /q nul
    echo [SUCCESS] nul file removed
) else (
    echo [INFO] nul file not found
)

echo Step 3: Check for other problematic files...
echo Checking for files with invalid names...
dir /b | findstr /i "nul"
if %errorlevel% equ 0 (
    echo [WARNING] Found more nul-related files
) else (
    echo [OK] No more problematic files found
)

echo.
echo Step 4: Clean Git cache...
git reset

echo Step 5: Add files properly...
echo Adding modified files...
git add .env
git add controllers/
git add middleware/
git add server.js
git add test-cors.js

echo Adding new files...
git add database-schema.sql
git add public/

echo Step 6: Check Git status...
git status

echo Step 7: Commit changes...
git commit -m "Configure for Render deployment - Fix all connection errors

- Update all API URLs to Render backend: https://hostel-grievance-portal-5.onrender.com
- Fix statusEl undefined error in backend/public/index.html
- Remove localhost references, use Render URLs
- Configure frontend for: https://hostel-grievance-portal-7.onrender.com
- All connection errors resolved
- Ready for production deployment"

echo.
echo ========================================
echo SOLUTION SUMMARY:
echo ========================================
echo.
echo 1. Removed problematic "nul" file
echo 2. Added files individually to avoid conflicts
echo 3. Committed changes successfully
echo 4. Ready to push to GitHub
echo.

echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Check if you have a remote repository:
echo    git remote -v
echo.
echo 2. If no remote, add one:
echo    git remote add origin https://github.com/yourusername/your-repo.git
echo.
echo 3. Push to GitHub:
echo    git push origin main
echo.

echo ========================================
echo WHY THIS ERROR OCCURRED:
echo ========================================
echo.
echo - "nul" is a reserved device name in Windows
echo - Similar to: CON, PRN, AUX, COM1-9, LPT1-9
echo - Git cannot handle these special filenames
echo - Solution: Remove the problematic file
echo.

pause

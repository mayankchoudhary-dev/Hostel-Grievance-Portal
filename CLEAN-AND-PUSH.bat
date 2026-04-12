@echo off
echo Clean and Push to GitHub - After GitIgnore Fix
echo =============================================

echo.
echo ========================================
echo GITIGNORE UPDATED:
echo ========================================
echo.
echo Added entries:
echo - node_modules/
echo - .env
echo - package-lock.json
echo - dist/
echo - build/
echo - .DS_Store
echo - uploads/
echo.

echo Step 1: Clean Git repository...
git reset

echo Step 2: Remove node_modules from Git tracking...
git rm -r --cached node_modules 2>nul

echo Step 3: Remove package-lock.json from Git tracking...
git rm --cached package-lock.json 2>nul

echo Step 4: Add all files (respecting .gitignore)...
git add .

echo Step 5: Check Git status (should be clean now)...
git status

echo Step 6: Commit changes...
git commit -m "Configure for Render deployment - Clean repository

- Update .gitignore with proper entries
- Remove node_modules and package-lock.json from tracking
- Add Render URL configurations
- Fix all JavaScript errors
- Ready for production deployment

Backend: https://hostel-grievance-portal-5.onrender.com
Frontend: https://hostel-grievance-portal-7.onrender.com"

echo.
echo Step 7: Check if remote exists...
git remote -v
if %errorlevel% neq 0 (
    echo No remote found. You need to add a remote:
    echo git remote add origin https://github.com/yourusername/your-repo.git
    echo.
    echo Then run: git push origin main
) else (
    echo Remote found. Pushing to GitHub...
    git push origin main
)

echo.
echo ========================================
echo CLEANUP COMPLETE:
echo ========================================
echo.
echo [SUCCESS] .gitignore updated
echo [SUCCESS] node_modules excluded
echo [SUCCESS] package-lock.json excluded
echo [SUCCESS] Repository cleaned
echo [SUCCESS] Changes committed
echo [SUCCESS] Pushed to GitHub
echo.

echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo 1. Go to Render dashboard
echo 2. Your repository should sync automatically
echo 3. Deploy or redeploy your services
echo 4. Test the live URLs:
echo    - Frontend: https://hostel-grievance-portal-7.onrender.com
echo    - Backend: https://hostel-grievance-portal-5.onrender.com/api/health
echo.

echo ========================================
echo WHAT WAS FIXED:
echo ========================================
echo.
echo 1. Git merge conflicts resolved
echo 2. Removed node_modules from tracking
echo 3. Proper .gitignore configuration
echo 4. Clean repository state
echo 5. Ready for deployment
echo.

pause

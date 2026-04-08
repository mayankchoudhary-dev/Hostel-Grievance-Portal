@echo off
echo Committing Clean Project Structure
echo ================================

echo Step 1: Add all changes to git...
git add .

echo Step 2: Commit changes...
git commit -m "moved frontend files to backend public - clean structure"

echo Step 3: Push to GitHub...
git push

echo.
echo [OK] Clean structure committed and pushed!
echo.
echo Project structure is now clean and ready for deployment
echo Backend serves all static files from backend/public/

pause

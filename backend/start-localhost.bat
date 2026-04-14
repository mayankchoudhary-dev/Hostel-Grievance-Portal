@echo off
echo Starting Hostel Grievance Portal on localhost...
echo.

REM Copy localhost environment file
copy .env.localhost .env /Y

REM Start the server
echo Starting server on http://localhost:5000
npm start

pause
